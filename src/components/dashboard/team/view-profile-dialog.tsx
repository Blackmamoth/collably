import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { formatDateSince } from "@/lib/common/helper";
import type { WorkspaceMember } from "@/lib/common/types";
import { Calendar, Mail, Shield } from "lucide-react";
import type { SetStateAction } from "react";

interface Props {
	viewProfileOpen: boolean;
	setViewProfileOpen: React.Dispatch<SetStateAction<boolean>>;
	selectedMember: WorkspaceMember | null;
}

export default function ViewProfileDialog({
	viewProfileOpen,
	setViewProfileOpen,
	selectedMember,
}: Props) {
	return (
		<Dialog open={viewProfileOpen} onOpenChange={setViewProfileOpen}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Member Profile</DialogTitle>
					<DialogDescription>
						View detailed information about this team member
					</DialogDescription>
				</DialogHeader>
				{selectedMember && (
					<div className="space-y-6">
						<div className="flex items-center gap-4">
							<Avatar className="h-20 w-20">
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
							<div className="flex-1">
								<h3 className="text-lg font-semibold">
									{selectedMember.user.name}
								</h3>
								<Badge variant={"default"}>Active</Badge>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center gap-3 text-sm">
								<Mail className="h-4 w-4 text-muted-foreground" />
								<div>
									<p className="text-xs text-muted-foreground">Email</p>
									<p className="font-medium">{selectedMember.user.email}</p>
								</div>
							</div>

							<div className="flex items-center gap-3 text-sm">
								<Shield className="h-4 w-4 text-muted-foreground" />
								<div>
									<p className="text-xs text-muted-foreground">Role</p>
									<p className="font-medium capitalize">
										{selectedMember.role}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-3 text-sm">
								<Calendar className="h-4 w-4 text-muted-foreground" />
								<div>
									<p className="text-xs text-muted-foreground">Joined</p>
									<p className="font-medium">
										{formatDateSince(selectedMember.createdAt)}
									</p>
								</div>
							</div>
						</div>
					</div>
				)}
				<DialogFooter>
					<Button variant="outline" onClick={() => setViewProfileOpen(false)}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
