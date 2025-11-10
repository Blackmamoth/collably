import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ElementType } from "@/lib/common/types";
import {
	ArrowRight,
	Circle,
	Hand,
	LayoutTemplate,
	Minus,
	MousePointer2,
	Sparkles,
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
	applyTemplate: (
		templateType: "swot" | "retrospective" | "brainstorming",
	) => void;
}

export default function DecisionBoardToolbar({
	selectedTool,
	setSelectedTool,
	applyTemplate,
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
			<div className="w-px h-6 bg-border mx-1" />
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="sm" title="Templates">
						<LayoutTemplate className="w-4 h-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="center" side="top">
					<DropdownMenuItem onClick={() => applyTemplate("swot")}>
						<Square className="w-4 h-4 mr-2" />
						SWOT Analysis
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => applyTemplate("retrospective")}>
						<StickyNote className="w-4 h-4 mr-2" />
						Retrospective
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => applyTemplate("brainstorming")}>
						<Sparkles className="w-4 h-4 mr-2" />
						Brainstorming
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
