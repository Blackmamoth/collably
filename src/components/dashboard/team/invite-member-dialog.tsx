import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";
import type { Workspace } from "@/lib/common/types";
import { useForm } from "@tanstack/react-form";
import { Mail, UserPlus } from "lucide-react";
import type { SetStateAction } from "react";
import { toast } from "sonner";
import * as z from "zod";

interface Props {
	isInviteOpen: boolean;
	setIsInviteOpen: React.Dispatch<SetStateAction<boolean>>;
	workspace: Workspace | null;
}

const schema = z.object({
	email: z.email({ message: "Email is required" }),
	role: z.enum(["owner", "member", "viewer"]),
});

export default function InviteMemberDialog({
	isInviteOpen,
	setIsInviteOpen,
	workspace,
}: Props) {
	const form = useForm({
		defaultValues: {
			email: "",
			role: "member",
		},
		validators: {
			onChange: schema,
		},
		onSubmit: async ({ value }) => {
			if (workspace !== null) {
				const { error } = await authClient.organization.inviteMember({
					email: value.email,
					role: value.role,
					organizationId: workspace.id,
				});

				if (error !== null) {
					toast.error(
						error.message || "Something went wrong! user was not invited",
					);
					return;
				}
			} else {
				toast.warning(
					"You need to be part of an active workspace to perform this action",
				);
			}
			setIsInviteOpen(false);
			form.reset();
		},
	});

	return (
		<Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
			<DialogTrigger asChild>
				<Button>
					<UserPlus className="w-4 h-4 mr-2" />
					Invite Members
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Invite Team Members</DialogTitle>
					<DialogDescription>
						Send an invitation to join your workspace
					</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
				>
					<div className="space-y-4 py-4">
						<form.Field name="email">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor="invite-email">Email address</Label>
									<Input
										id={"invite-email"}
										type="email"
										placeholder="colleague@example.com"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
									{field.state.meta.errors.length > 0 && (
										<p className="text-sm text-destructive">
											{field.state.meta.errors[0]?.message}
										</p>
									)}
								</div>
							)}
						</form.Field>

						<form.Field name="role">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor="invite-role">Role</Label>
									<Select
										value={field.state.value}
										onValueChange={field.handleChange}
									>
										<SelectTrigger id={"invite-role"}>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="admin">
												Admin - Full workspace access
											</SelectItem>
											<SelectItem value="member">
												Member - Standard access
											</SelectItem>
											<SelectItem value="viewer">
												Viewer - Read-only access
											</SelectItem>
										</SelectContent>
									</Select>
									{field.state.meta.errors.length > 0 && (
										<p className="text-sm text-destructive">
											{field.state.meta.errors[0]?.message}
										</p>
									)}
								</div>
							)}
						</form.Field>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsInviteOpen(false)}>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={form.getAllErrors().form.errors.length !== 0}
						>
							<Mail className="w-4 h-4 mr-2" />
							Send Invitation
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
