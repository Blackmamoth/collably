import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import type { SetStateAction } from "react";

interface Props {
	zoom: number;
	setZoom: React.Dispatch<SetStateAction<number>>;
}

export default function DecisionBoardZoomControls({ zoom, setZoom }: Props) {
	return (
		<div className="absolute bottom-6 right-6 bg-card border border-border rounded-lg shadow-lg p-2 flex flex-col gap-2">
			<Button
				variant="ghost"
				size="icon"
				onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
			>
				<ZoomIn className="w-4 h-4" />
			</Button>
			<Separator />
			<div className="text-xs text-center px-2 font-mono">
				{Math.round(zoom * 100)}%
			</div>
			<Separator />
			<Button
				variant="ghost"
				size="icon"
				onClick={() => setZoom((z) => Math.max(0.1, z - 0.1))}
			>
				<ZoomOut className="w-4 h-4" />
			</Button>
			<Separator />
			<Button variant="ghost" size="icon" onClick={() => setZoom(1)}>
				<Maximize2 className="w-4 h-4" />
			</Button>
		</div>
	);
}
