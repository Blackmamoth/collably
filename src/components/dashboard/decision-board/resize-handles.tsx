import type {
	BoardElement,
	CanvasElement,
	ResizeHandle,
} from "@/lib/common/types";
import type { Id } from "convex/_generated/dataModel";

export default function ResizeHandles({
	element,
	selectedElement,
	handleResizeMouseDown,
}: {
	element: BoardElement;
	selectedElement: Id<"element"> | null;
	handleResizeMouseDown: (
		e: React.MouseEvent,
		elementId: Id<"element">,
		handle: ResizeHandle,
	) => void;
}) {
	if (
		element.elementType !== "note" &&
		element.elementType !== "rectangle" &&
		element.elementType !== "circle"
	)
		return null;
	if (selectedElement !== element._id) return null;

	const handles: ResizeHandle[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
	// const size = element.size;

	return (
		<>
			{handles.map((handle) => {
				const style: React.CSSProperties = {
					position: "absolute",
					width: "8px",
					height: "8px",
					backgroundColor: "#3b82f6",
					border: "1px solid white",
					borderRadius: "50%",
					cursor: `${handle}-resize`,
					zIndex: 10,
				};

				if (handle.includes("n")) style.top = "-4px";
				if (handle.includes("s")) style.bottom = "-4px";
				if (handle.includes("w")) style.left = "-4px";
				if (handle.includes("e")) style.right = "-4px";
				if (handle === "n" || handle === "s") style.left = `calc(50% - 4px)`;
				if (handle === "w" || handle === "e") style.top = `calc(50% - 4px)`;

				return (
					<div
						key={handle}
						style={style}
						onMouseDown={(e) => handleResizeMouseDown(e, element._id, handle)}
					/>
				);
			})}
		</>
	);
}
