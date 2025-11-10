import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, Sparkles, ThumbsUp } from "lucide-react";
import type { SetStateAction } from "react";
import type {
	BoardElement,
	CanvasElement,
	LiveCursor,
	StickyNoteElement,
} from "@/lib/common/types";
import type { Id } from "convex/_generated/dataModel";

interface Props {
	liveCursors: LiveCursor[];
	elements: BoardElement[];
	setSelectedElement: React.Dispatch<SetStateAction<Id<"element"> | null>>;
	setShowAISummary: React.Dispatch<SetStateAction<boolean>>;
}

export default function AISummarySidebar({
	liveCursors,
	elements,
	setSelectedElement,
	setShowAISummary,
}: Props) {
	return (
		<div className="w-80 border-l border-border bg-card flex flex-col">
			<div className="p-4 border-b border-border flex items-center justify-between">
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
			<ScrollArea className="flex-1 p-4">
				<div className="space-y-4">
					<div>
						<h3 className="text-sm font-semibold mb-2">Board Summary</h3>
						<p className="text-sm text-muted-foreground leading-relaxed">
							Your board contains {elements.length} elements. The team is
							actively collaborating with {liveCursors.length} members online.
						</p>
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

					<Button variant="outline" className="w-full bg-transparent" size="sm">
						<Sparkles className="w-4 h-4 mr-2" />
						Generate Summary
					</Button>
				</div>
			</ScrollArea>
		</div>
	);
}
