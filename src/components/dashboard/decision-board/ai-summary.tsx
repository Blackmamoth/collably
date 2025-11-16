import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useAction, useQuery } from "convex/react";
import { ChevronRight, Loader2, Sparkles, ThumbsUp } from "lucide-react";
import { type SetStateAction, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { BoardElement, LiveCursor } from "@/lib/common/types";

interface Props {
	liveCursors: LiveCursor[];
	elements: BoardElement[];
	projectId: Id<"project">;
	setSelectedElement: React.Dispatch<SetStateAction<Id<"element"> | null>>;
	setShowAISummary: React.Dispatch<SetStateAction<boolean>>;
}

export default function AISummarySidebar({
	liveCursors: _liveCursors,
	elements,
	projectId,
	setSelectedElement,
	setShowAISummary,
}: Props) {
	const [isGenerating, setIsGenerating] = useState(false);
	const generateSummary = useAction(api.element.generateBoardSummary);
	const summary = useQuery(api.element.getBoardSummary, { projectId });

	const handleGenerateSummary = async () => {
		setIsGenerating(true);
		try {
			await generateSummary({ projectId });
			toast.success("Summary generated successfully");
		} catch (error) {
			console.error("Failed to generate summary:", error);
			toast.error("Failed to generate summary. Please try again.");
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<div className="w-80 border-l border-border bg-card flex flex-col h-full">
			<div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
				<div className="flex items-center gap-2">
					<Sparkles className="w-5 h-5 text-primary" />
					<h2 className="font-semibold">AI Insights</h2>
				</div>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setShowAISummary(false)}
				>
					<ChevronRight className="w-5 h-5" />
				</Button>
			</div>
			<ScrollArea className="flex-1 min-h-0">
				<div className="space-y-4 p-4">
					<div>
						<h3 className="text-sm font-semibold mb-2">Board Summary</h3>
						{summary === undefined ? (
							<p className="text-sm text-muted-foreground leading-relaxed">
								Loading...
							</p>
						) : summary.length > 0 ? (
							<p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
								{summary}
							</p>
						) : null}
					</div>

					<Separator />

					<div>
						<h3 className="text-sm font-semibold mb-2">Top Voted Ideas</h3>
						<div className="space-y-2">
							{elements
								.filter(
									(el): el is BoardElement =>
										el.elementType === "note" || el.elementType === "sticky",
								) // Filter for note or sticky
								.sort((a, b) => b.votes - a.votes)
								.slice(0, 3)
								.map((note) => (
									<div
										key={note._id}
										className="text-sm p-2 rounded bg-muted/50 cursor-pointer hover:bg-muted"
										onClick={() => setSelectedElement(note._id)}
									>
										<div className="flex items-center gap-2 mb-1">
											<ThumbsUp className="w-3 h-3" />
											<span className="font-medium">{note.votes} votes</span>
										</div>
										<p className="text-xs text-muted-foreground line-clamp-2">
											{note.content}
										</p>
									</div>
								))}
						</div>
					</div>

					<Separator />

					<Button
						variant="outline"
						className="w-full bg-transparent"
						size="sm"
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							handleGenerateSummary();
						}}
						disabled={isGenerating}
						type="button"
					>
						{isGenerating ? (
							<>
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
								Generating...
							</>
						) : (
							<>
								<Sparkles className="w-4 h-4 mr-2" />
								Generate Summary
							</>
						)}
					</Button>
				</div>
			</ScrollArea>
		</div>
	);
}
