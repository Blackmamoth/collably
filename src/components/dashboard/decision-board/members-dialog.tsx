import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ActiveMember, WorkspaceMember } from "@/lib/common/types";
import type { SetStateAction } from "react";

interface Props {
	membersDialogOpen: boolean;
	setMembersDialogOpen: React.Dispatch<SetStateAction<boolean>>;
	workspaceMembers: WorkspaceMember[];
	activeMembers: ActiveMember[];
}

export default function DecisionBoardMembersDialog({
	membersDialogOpen,
	setMembersDialogOpen,
	workspaceMembers,
	activeMembers,
}: Props) {
	return (
		<Dialog open={membersDialogOpen} onOpenChange={setMembersDialogOpen}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Board Members</DialogTitle>
					<DialogDescription>
						Members currently on this decision board
					</DialogDescription>
				</DialogHeader>
				<ScrollArea className="max-h-[400px] pr-4">
					<div className="space-y-2">
						{workspaceMembers.map((member) => (
							<div
								key={member.id}
								className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
							>
								<div className="flex items-center gap-3">
									<Avatar className="w-10 h-10">
										<AvatarImage
											src={member.user.image || "/placeholder.svg"}
										/>
										<AvatarFallback>{member.user.name[0]}</AvatarFallback>
									</Avatar>
									<div>
										<p className="font-medium text-sm">{member.user.name}</p>
										<p className="font-medium text-sm">{member.role}</p>
									</div>
								</div>
								<div>
									{activeMembers.find(
										(activeMember) => activeMember.memberId === member.id,
									) ? (
										<Badge
											variant="secondary"
											className="bg-green-500/10 text-green-600 border-green-500/20"
										>
											Active
										</Badge>
									) : (
										<Badge variant="outline" className="text-muted-foreground">
											Away
										</Badge>
									)}
								</div>
							</div>
						))}
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
