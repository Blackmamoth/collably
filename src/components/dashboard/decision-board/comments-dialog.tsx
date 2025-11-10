import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useState, type SetStateAction } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Send } from "lucide-react";
import type { StickyNoteElement } from "@/lib/common/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Id } from "convex/_generated/dataModel";

interface Props {
	commentsDialogOpen: boolean;
	setCommentsDialogOpen: React.Dispatch<SetStateAction<boolean>>;
	selectedNoteData: StickyNoteElement | undefined;
	selectedNoteForComments: Id<"element"> | null;
	handleAddComment: (noteId: Id<"element">) => void;
}

export default function DecisionBoardComments({
	commentsDialogOpen,
	setCommentsDialogOpen,
	selectedNoteData,
	selectedNoteForComments,
	handleAddComment,
}: Props) {
	const [newComment, setNewComment] = useState("");

	return (
		<Dialog open={commentsDialogOpen} onOpenChange={setCommentsDialogOpen}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Comments</DialogTitle>
					<DialogDescription>
						{selectedNoteData
							? `"${selectedNoteData.content.slice(0, 50)}${selectedNoteData.content.length > 50 ? "..." : ""}"`
							: ""}
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					<ScrollArea className="h-[300px] pr-4">
						{selectedNoteData && selectedNoteData.comments.length > 0 ? (
							<div className="space-y-4">
								{selectedNoteData.comments.map((comment) => (
									<div key={comment.id} className="flex gap-3">
										<Avatar className="w-8 h-8 shrink-0">
											<AvatarFallback className="text-xs">
												{comment.author[0]}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1 space-y-1">
											<div className="flex items-center gap-2">
												<span className="text-sm font-medium">
													{comment.author}
												</span>
												<span className="text-xs text-muted-foreground">
													{comment.timestamp}
												</span>
											</div>
											<p className="text-sm text-muted-foreground leading-relaxed">
												{comment.content}
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
