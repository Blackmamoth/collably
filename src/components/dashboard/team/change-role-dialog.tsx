import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, type SetStateAction } from "react";
import type { WorkspaceMember } from "@/lib/common/types";
import { authClient } from "@/lib/auth-client";
import { useWorkspace } from "@/lib/workspace-context";
import { toast } from "sonner";

interface Props {
	changeRoleOpen: boolean;
	setChangeRoleOpen: React.Dispatch<SetStateAction<boolean>>;
	selectedRole: string;
	setSelectedRole: React.Dispatch<SetStateAction<string>>;
	selectedMember: WorkspaceMember | null;
}

export default function ChangeRoleDialog({
	changeRoleOpen,
	setChangeRoleOpen,
	selectedRole,
	setSelectedRole,
	selectedMember,
}: Props) {
	const [isChangingRole, setIsChangingRole] = useState(false);

	const workspace = useWorkspace();

	const confirmChangeRole = async () => {
		if (workspace !== null) {
			if (selectedMember !== null) {
				const { error } = await authClient.organization.updateMemberRole({
					memberId: selectedMember.id,
					role: selectedRole,
					organizationId: workspace.id,
				});

				if (error !== null) {
					toast.error(
						error.message || "User role could not be updated! please try again",
					);
				}
			}
		} else {
			toast.error(
				"You need to be part of an active workspace to perform this action",
			);
		}
		setIsChangingRole(false);
		setChangeRoleOpen(false);
	};

	return (
		<Dialog open={changeRoleOpen} onOpenChange={setChangeRoleOpen}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Change Member Role</DialogTitle>
					<DialogDescription>
						Update the role and permissions for {selectedMember?.user?.name}
					</DialogDescription>
				</DialogHeader>
				{selectedMember && (
					<div className="space-y-4 py-4">
						<div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
							<Avatar>
								<AvatarImage
									src={selectedMember.user.image || "/placeholder.svg"}
									alt={selectedMember.user.name}
								/>
								<AvatarFallback>
									{selectedMember.user.name
										.split(" ")
										.map((n) => n[0])
										.join("")}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1 min-w-0">
								<p className="font-medium truncate">
									{selectedMember.user.name}
								</p>
								<p className="text-sm text-muted-foreground truncate">
									{selectedMember.user.email}
								</p>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="role">Role</Label>
							<Select value={selectedRole} onValueChange={setSelectedRole}>
								<SelectTrigger id={"role"}>
									<SelectValue placeholder="Select a role" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="owner">Owner</SelectItem>
									<SelectItem value="member">Member</SelectItem>
									<SelectItem value="viewer">Viewer</SelectItem>
								</SelectContent>
							</Select>
							{selectedRole && (
								<p className="text-sm text-muted-foreground">
									{selectedRole === "owner" &&
										"Full access to all workspace settings"}
									{selectedRole === "admin" &&
										"Can manage projects and members"}
									{selectedRole === "member" && "Can view and edit projects"}
									{selectedRole === "viewer" && "Read-only access"}
								</p>
							)}
						</div>
					</div>
				)}
				<DialogFooter>
					<Button variant="outline" onClick={() => setChangeRoleOpen(false)}>
						Cancel
					</Button>
					<Button onClick={confirmChangeRole} disabled={isChangingRole}>
						{isChangingRole ? "Updating..." : "Update Role"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
