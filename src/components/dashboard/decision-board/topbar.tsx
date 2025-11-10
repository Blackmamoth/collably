import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	Download,
	MoreVertical,
	Presentation,
	Share2,
	Sparkles,
	Users,
} from "lucide-react";
import type { ElementType, WorkspaceMember } from "@/lib/common/types";
import type { SetStateAction } from "react";

interface Props {
	projectId: string;
	visibleMembers: WorkspaceMember[];
	remainingCount: number;
	project: { name: string };
	showAISummary: boolean;
	setShowAISummary: React.Dispatch<SetStateAction<boolean>>;
	setMembersDialogOpen: React.Dispatch<SetStateAction<boolean>>;
	setIsFocusMode: React.Dispatch<SetStateAction<boolean>>;
	setSelectedTool: React.Dispatch<
		SetStateAction<ElementType | "select" | "hand">
	>;
	setShareDialogOpen: React.Dispatch<SetStateAction<boolean>>;
}

export default function DecisionBoardTopbar({
	projectId,
	visibleMembers,
	remainingCount,
	project,
	setMembersDialogOpen,
	setIsFocusMode,
	setSelectedTool,
	setShareDialogOpen,
	setShowAISummary,
	showAISummary,
}: Props) {
	return (
		<header className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0">
			<div className="flex items-center gap-4">
				<Link
					to={`/dashboard/project/$projectId`}
					params={{ projectId: projectId }}
				>
					<Button variant="ghost" size="icon">
						<ArrowLeft className="w-5 h-5" />
					</Button>
				</Link>
				<div>
					<h1 className="font-semibold">{project.name}</h1>
					<p className="text-xs text-muted-foreground">Decision Board</p>
				</div>
			</div>

			<div className="flex items-center gap-2">
				<button
					type="button"
					className="flex items-center -space-x-2 mr-2 hover:opacity-80 transition-opacity"
					onClick={() => setMembersDialogOpen(true)}
					title="View all board members"
				>
					{visibleMembers.map((member) => (
						<div key={member.id} className="relative">
							<Avatar className="w-8 h-8 border-2 border-background">
								<AvatarImage src={member.user.image || "/placeholder.svg"} />
								<AvatarFallback>{member.user.name[0]}</AvatarFallback>
							</Avatar>
							<span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
						</div>
					))}
					{remainingCount > 0 && (
						<div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
							<span className="text-xs font-medium">+{remainingCount}</span>
						</div>
					)}
				</button>

				<Button
					variant="outline"
					size="sm"
					onClick={() => {
						setIsFocusMode(true);
						setSelectedTool("hand");
					}}
				>
					<Presentation className="w-4 h-4 mr-2" />
					Focus Mode
				</Button>

				<Button
					variant="outline"
					size="sm"
					onClick={() => setShowAISummary(!showAISummary)}
				>
					<Sparkles className="w-4 h-4 mr-2" />
					AI Insights
				</Button>

				<Button
					variant="outline"
					size="sm"
					onClick={() => setShareDialogOpen(true)}
				>
					<Share2 className="w-4 h-4 mr-2" />
					Share
				</Button>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon">
							<MoreVertical className="w-5 h-5" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem>
							<Download className="w-4 h-4 mr-2" />
							Export as PDF
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem asChild>
							<Link to="/dashboard/team">
								<Users className="w-4 h-4 mr-2" />
								Manage members
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem className="text-destructive">
							Delete board
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
}
