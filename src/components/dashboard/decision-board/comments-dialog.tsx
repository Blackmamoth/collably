import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { SetStateAction } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { formatDateUntil } from "@/lib/common/helper";

interface SelectedNote {
	_id: Id<"element">;
	_creationTime: number;
	content?: string | undefined;
	color?: string | undefined;
	width?: number | undefined;
	height?: number | undefined;
	endX?: number | undefined;
	endY?: number | undefined;
	strokeColor?: string | undefined;
	strokeWidth?: number | undefined;
	fillColor?: string | undefined;
	fontSize?: number | undefined;
	fontWeight?: string | undefined;
	groupId?: string | undefined;
	createdAt: number;
	updatedAt: number;
	projectId: Id<"project">;
	createdBy: string;
	elementType:
		| "line"
		| "sticky"
		| "note"
		| "text"
		| "rectangle"
		| "circle"
		| "arrow";
	x: number;
	y: number;
	votes: number;
}

interface Props {
	newComment: string;
	setNewComment: React.Dispatch<SetStateAction<string>>;
	commentsDialogOpen: boolean;
	setCommentsDialogOpen: React.Dispatch<SetStateAction<boolean>>;
	selectedNoteData: SelectedNote;
	selectedNoteForComments: Id<"element"> | null;
	handleAddComment: (noteId: Id<"element">) => void;
	noteId: Id<"element">;
	projectId: Id<"project">;
}

export default function DecisionBoardComments({
	newComment,
	setNewComment,
	commentsDialogOpen,
	setCommentsDialogOpen,
	selectedNoteData,
	selectedNoteForComments,
	handleAddComment,
	noteId,
	projectId,
}: Props) {
	const comments =
		useQuery(api.element.getComments, { id: noteId, projectId }) || [];

	return (
		<Dialog open={commentsDialogOpen} onOpenChange={setCommentsDialogOpen}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Comments</DialogTitle>
					<DialogDescription>
						{selectedNoteData.content
							? `"${selectedNoteData.content.slice(0, 50)}${selectedNoteData.content.length > 50 ? "..." : ""}"`
							: ""}
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					<ScrollArea className="h-[300px] pr-4">
						{comments.length > 0 ? (
							<div className="space-y-4">
								{comments.map((comment) => (
									<div key={comment._id} className="flex gap-3">
										<Avatar className="w-8 h-8 shrink-0">
											<AvatarFallback className="text-xs">
												{comment.memberName[0]}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1 space-y-1">
											<div className="flex items-center gap-2">
												<span className="text-sm font-medium">
													{comment.memberName}
												</span>
												<span className="text-xs text-muted-foreground">
													{formatDateUntil(comment.createdAt, "Commented")}
												</span>
											</div>
											<p className="text-sm text-muted-foreground leading-relaxed">
												{comment.text}
											</p>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="flex items-center justify-center h-full text-sm text-muted-foreground">
								No comments yet. Be the first to comment!
							</div>
						)}
					</ScrollArea>
					<Separator />
					<div className="flex gap-2">
						<Input
							placeholder="Add a comment..."
							value={newComment}
							onChange={(e) => setNewComment(e.target.value)}
							onKeyDown={(e) => {
								if (
									e.key === "Enter" &&
									!e.shiftKey &&
									selectedNoteForComments
								) {
									e.preventDefault();
									handleAddComment(selectedNoteForComments);
								}
							}}
						/>
						<Button
							size="icon"
							onClick={() => {
								if (selectedNoteForComments) {
									handleAddComment(selectedNoteForComments);
								}
							}}
							disabled={!newComment.trim()}
						>
							<Send className="w-4 h-4" />
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
