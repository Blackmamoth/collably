import { Button } from "@/components/ui/button";
import type { ElementType } from "@/lib/common/types";
import {
	ArrowRight,
	Circle,
	Hand,
	Minus,
	MousePointer2,
	Square,
	StickyNote,
	Type,
} from "lucide-react";
import type { SetStateAction } from "react";

interface Props {
	selectedTool: ElementType | "select" | "hand";
	setSelectedTool: React.Dispatch<
		SetStateAction<ElementType | "select" | "hand">
	>;
}

export default function DecisionBoardToolbar({
	selectedTool,
	setSelectedTool,
}: Props) {
	return (
		<div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-card border border-border rounded-lg shadow-lg p-2 flex items-center gap-1">
			<Button
				variant={selectedTool === "select" ? "default" : "ghost"}
				size="sm"
				onClick={() => setSelectedTool("select")}
				title="Select (V)"
			>
				<MousePointer2 className="w-4 h-4" />
			</Button>
			<Button
				variant={selectedTool === "hand" ? "default" : "ghost"}
				size="sm"
				onClick={() => setSelectedTool("hand")}
				title="Hand Tool (H) - Pan canvas"
			>
				<Hand className="w-4 h-4" />
			</Button>
			<div className="w-px h-6 bg-border mx-1" />
			<Button
				variant={selectedTool === "note" ? "default" : "ghost"}
				size="sm"
				onClick={() => setSelectedTool("note")}
				title="Sticky Note (N)"
			>
				<StickyNote className="w-4 h-4" />
			</Button>
			<Button
				variant={selectedTool === "text" ? "default" : "ghost"}
				size="sm"
				onClick={() => setSelectedTool("text")}
				title="Text (T)"
			>
				<Type className="w-4 h-4" />
			</Button>
			<div className="w-px h-6 bg-border mx-1" />
			<Button
				variant={selectedTool === "rectangle" ? "default" : "ghost"}
				size="sm"
				onClick={() => setSelectedTool("rectangle")}
				title="Rectangle (R)"
			>
				<Square className="w-4 h-4" />
			</Button>
			<Button
				variant={selectedTool === "circle" ? "default" : "ghost"}
				size="sm"
				onClick={() => setSelectedTool("circle")}
				title="Circle (C)"
			>
				<Circle className="w-4 h-4" />
			</Button>
			<div className="w-px h-6 bg-border mx-1" />
			<Button
				variant={selectedTool === "arrow" ? "default" : "ghost"}
				size="sm"
				onClick={() => setSelectedTool("arrow")}
				title="Arrow (A)"
			>
				<ArrowRight className="w-4 h-4" />
			</Button>
			<Button
				variant={selectedTool === "line" ? "default" : "ghost"}
				size="sm"
				onClick={() => setSelectedTool("line")}
				title="Line (L)"
			>
				<Minus className="w-4 h-4" />
			</Button>
		</div>
	);
}
