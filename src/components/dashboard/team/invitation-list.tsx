import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatExpiresIn } from "@/lib/common/helper";
import { Button } from "@/components/ui/button";
import type { Invitation } from "better-auth/plugins";

interface Props {
	handleCancelInvite: (invite: Invitation) => void;
	workspaceInvitations: Invitation[];
}

export default function InvitationList({
	handleCancelInvite,
	workspaceInvitations,
}: Props) {
	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2">
				<h3 className="text-sm font-medium">Pending Invitations</h3>
				<Badge variant="outline">{workspaceInvitations.length}</Badge>
			</div>
			<div className="space-y-2">
				{workspaceInvitations.map((invite) => (
					<div
						key={invite.id}
						className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/30"
					>
						<div className="flex items-center gap-3 flex-1 min-w-0">
							<Avatar className="w-10 h-10">
								<AvatarFallback>{invite.email[0].toUpperCase()}</AvatarFallback>
							</Avatar>
							<div className="flex-1 min-w-0">
								<p className="font-medium truncate">{invite.email}</p>
								<div className="flex items-center gap-2 mt-1">
									<Badge
										variant={
											invite.status === "pending"
												? "secondary"
												: invite.status === "accepted"
													? "default"
													: "outline"
										}
										className="text-xs capitalize"
									>
										{invite.status}
									</Badge>
									<span className="text-xs text-muted-foreground">•</span>
									<p className="text-xs text-muted-foreground">
										{formatExpiresIn(invite.expiresAt)}
									</p>
								</div>
							</div>
							<Badge variant="outline" className="shrink-0 capitalize">
								{invite.role}
							</Badge>
						</div>
						{invite.status === "pending" && (
							<div className="flex items-center gap-2 ml-4">
								<Button
									variant="outline"
									size="sm"
									onClick={() => handleCancelInvite(invite)}
								>
									Cancel Invite
								</Button>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
