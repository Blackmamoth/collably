import {
	createFileRoute,
	Link,
	redirect,
	useParams,
} from "@tanstack/react-router";
import type React from "react";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	ArrowLeft,
	Share2,
	Sparkles,
	Trash2,
	MoreVertical,
	ChevronRight,
	Users,
	ZoomIn,
	ZoomOut,
	Maximize2,
	Download,
	MessageSquare,
	ThumbsUp,
	ArrowRight,
	Type,
	Square,
	Circle,
	Minus,
	StickyNote,
	Hand,
	MousePointer2,
	Send,
	LayoutTemplate,
	Presentation,
	X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type {
	CanvasElement,
	ConnectorElement,
	ElementType,
	LiveCursor,
	ResizeHandle,
	ShapeElement,
	StickyNoteElement,
	TextElement,
} from "@/lib/common/types";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { generateColorFromId } from "@/lib/common/helper";

const colorOptions = [
	{
		name: "yellow",
		bg: "bg-yellow-500/10",
		border: "border-yellow-500/20",
		text: "text-yellow-900 dark:text-yellow-100",
	},
	{
		name: "pink",
		bg: "bg-pink-500/10",
		border: "border-pink-500/20",
		text: "text-pink-900 dark:text-pink-100",
	},
	{
		name: "blue",
		bg: "bg-blue-500/10",
		border: "border-blue-500/20",
		text: "text-blue-900 dark:text-blue-100",
	},
	{
		name: "green",
		bg: "bg-green-500/10",
		border: "border-green-500/20",
		text: "text-green-900 dark:text-green-100",
	},
	{
		name: "purple",
		bg: "bg-purple-500/10",
		border: "border-purple-500/20",
		text: "text-purple-900 dark:text-purple-100",
	},
	{
		name: "orange",
		bg: "bg-orange-500/10",
		border: "border-orange-500/20",
		text: "text-orange-900 dark:text-orange-100",
	},
];

// Throttle utility to limit how often a function runs
function throttle<T extends (...args: any[]) => any>(
	func: T,
	wait: number,
): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout | null = null;
	let previous = 0;

	return function executedFunction(...args: Parameters<T>) {
		const now = Date.now();
		const remaining = wait - (now - previous);

		if (remaining <= 0 || remaining > wait) {
			if (timeout) {
				clearTimeout(timeout);
				timeout = null;
			}
			previous = now;
			func(...args);
		} else if (!timeout) {
			timeout = setTimeout(() => {
				previous = Date.now();
				timeout = null;
				func(...args);
			}, remaining);
		}
	};
}

// Helper function to check if a point is near a line segment
const isPointNearLine = (
	point: { x: number; y: number },
	start: { x: number; y: number },
	end: { x: number; y: number },
	threshold: number,
): boolean => {
	const dx = end.x - start.x;
	const dy = end.y - start.y;
	const lengthSquared = dx * dx + dy * dy;
	if (lengthSquared === 0)
		return Math.hypot(point.x - start.x, point.y - start.y) < threshold;

	const t =
		((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared;
	const tClamped = Math.max(0, Math.min(1, t));

	const closestX = start.x + tClamped * dx;
	const closestY = start.y + tClamped * dy;

	return Math.hypot(point.x - closestX, point.y - closestY) < threshold;
};

const ResizeHandles = ({
	element,
	selectedElement,
	handleResizeMouseDown,
}: {
	element: CanvasElement;
	selectedElement: number | null;
	handleResizeMouseDown: (
		e: React.MouseEvent,
		elementId: number,
		handle: ResizeHandle,
	) => void;
}) => {
	if (
		element.type !== "note" &&
		element.type !== "rectangle" &&
		element.type !== "circle"
	)
		return null;
	if (selectedElement !== element.id) return null;

	const handles: ResizeHandle[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
	const size = element.size;

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
						onMouseDown={(e) => handleResizeMouseDown(e, element.id, handle)}
					/>
				);
			})}
		</>
	);
};

export const Route = createFileRoute(
	"/dashboard/project/$projectId/decision-board",
)({
	component: RouteComponent,
	beforeLoad: ({ context }) => {
		const { user } = context;

		if (user === undefined) {
			throw redirect({ to: "/login" });
		}

		return { user };
	},
	loader: async ({ context, params }) => {
		const { projectId } = params;

		try {
			const project = await context.convexClient.query(api.project.getProject, {
				projectId: projectId as Id<"project">,
			});
			return { project };
		} catch (error) {
			throw redirect({ to: "/dashboard" });
		}
	},
});

function RouteComponent() {
	const [elements, setElements] = useState<CanvasElement[]>([
		{
			id: 1,
			type: "note",
			content:
				"Welcome to your Decision Board! Add notes, text, shapes, and connectors to organize your ideas.",
			color: "blue",
			author: "System",
			timestamp: "Just now",
			position: { x: 200, y: 200 },
			size: { width: 280, height: 180 },
			votes: 0,
			comments: [],
		},
	]);

	// const [liveCursors, setLiveCursors] = useState<LiveCursor[]>([
	// 	{
	// 		id: "user1",
	// 		name: "Alice",
	// 		color: "#3b82f6",
	// 		position: { x: 400, y: 300 },
	// 	},
	// 	{
	// 		id: "user2",
	// 		name: "Bob",
	// 		color: "#10b981",
	// 		position: { x: 600, y: 400 },
	// 	},
	// ]);

	const [selectedTool, setSelectedTool] = useState<
		ElementType | "select" | "hand"
	>("select");
	const [selectedElement, setSelectedElement] = useState<number | null>(null);
	const [editingElement, setEditingElement] = useState<number | null>(null);
	const [zoom, setZoom] = useState(1);
	const [pan, setPan] = useState({ x: 0, y: 0 });
	const [isPanning, setIsPanning] = useState(false);
	const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 }); // Renamed from panStart for clarity
	const [draggedElement, setDraggedElement] = useState<number | null>(null);
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
	const [isDrawing, setIsDrawing] = useState(false);
	const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
	const [previewElement, setPreviewElement] = useState<{
		start: { x: number; y: number };
		end: { x: number; y: number };
		type: ElementType;
	} | null>(null);
	const [resizingElement, setResizingElement] = useState<{
		id: number;
		handle: ResizeHandle;
		startPos: { x: number; y: number };
		startSize: { width: number; height: number };
		startElementPos: { x: number; y: number };
	} | null>(null);
	const [showAISummary, setShowAISummary] = useState(false);
	const [isFocusMode, setIsFocusMode] = useState(false);

	const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
	const [selectedNoteForComments, setSelectedNoteForComments] = useState<
		number | null
	>(null);
	const [newComment, setNewComment] = useState("");
	const [membersDialogOpen, setMembersDialogOpen] = useState(false);
	const [shareDialogOpen, setShareDialogOpen] = useState(false);

	const canvasRef = useRef<HTMLDivElement>(null);

	const getColorClasses = (colorName: string) => {
		return colorOptions.find((c) => c.name === colorName) || colorOptions[0];
	};

	const screenToCanvas = (screenX: number, screenY: number) => {
		if (!canvasRef.current) return { x: 0, y: 0 };
		const rect = canvasRef.current.getBoundingClientRect();
		return {
			x: (screenX - rect.left - pan.x) / zoom,
			y: (screenY - rect.top - pan.y) / zoom,
		};
	};

	const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
		// Handle panning if middle mouse button or hand tool is selected
		if (e.button === 1 || selectedTool === "hand") {
			setIsPanning(true);
			setLastPanPoint({ x: e.clientX, y: e.clientY }); // Use current mouse position for pan start
			e.preventDefault(); // Prevent default browser behavior for middle click
			return;
		}

		const target = e.target as HTMLElement;
		const clickedOnCanvas =
			target === canvasRef.current || target.closest(".canvas-background");

		// If clicking on the canvas itself and not an element
		if (clickedOnCanvas) {
			// Start drawing a new element
			if (selectedTool === "arrow" || selectedTool === "line") {
				setIsDrawing(true);
				const canvasPos = screenToCanvas(e.clientX, e.clientY);
				setDrawStart(canvasPos);
				setPreviewElement({
					start: canvasPos,
					end: canvasPos,
					type: selectedTool,
				});
			} else if (selectedTool === "rectangle" || selectedTool === "circle") {
				setIsDrawing(true);
				const canvasPos = screenToCanvas(e.clientX, e.clientY);
				setDrawStart(canvasPos);
				setPreviewElement({
					start: canvasPos,
					end: canvasPos,
					type: selectedTool,
				});
			} else if (selectedTool === "text") {
				const canvasPos = screenToCanvas(e.clientX, e.clientY);
				const newElement: TextElement = {
					id: Date.now(),
					type: "text",
					content: "Edit me",
					fontSize: 16,
					fontWeight: "normal",
					color: "#ffffff", // Default text color
					position: canvasPos,
					author: "You",
					timestamp: new Date().toISOString(),
				};
				setElements([...elements, newElement]);
				setSelectedElement(newElement.id);
				setEditingElement(newElement.id);
				setSelectedTool("select"); // Switch back to select tool after adding
			} else if (selectedTool === "note") {
				const canvasPos = screenToCanvas(e.clientX, e.clientY);
				const newElement: StickyNoteElement = {
					id: Date.now(),
					type: "note",
					content: "Edit me",
					color: "yellow", // Default color
					size: { width: 240, height: 160 },
					position: canvasPos,
					votes: 0,
					comments: [],
					author: "You",
					timestamp: new Date().toISOString(),
				};
				setElements([...elements, newElement]);
				setSelectedElement(newElement.id);
				setEditingElement(newElement.id);
				setSelectedTool("select"); // Switch back to select tool after adding
			} else {
				// If selecting tool is 'select' or 'hand' and not panning, deselect elements
				setSelectedElement(null);
			}
		} else {
			// If clicking on an existing element
			const clickedElementId = Number.parseInt(
				(e.target as HTMLElement).closest("[data-element-id]")?.dataset
					.elementId || "-1",
			);

			if (clickedElementId !== -1) {
				const element = elements.find((el) => el.id === clickedElementId);
				if (element) {
					if (selectedTool === "select") {
						setSelectedElement(element.id);
						setDraggedElement(element.id);
						const canvasPos = screenToCanvas(e.clientX, e.clientY);
						setDragOffset({
							x: canvasPos.x - element.position.x,
							y: canvasPos.y - element.position.y,
						});

						// Bring selected element to front
						setElements((prev) => {
							const filtered = prev.filter((el) => el.id !== clickedElementId);
							return [...filtered, element];
						});
					} else if (
						(selectedTool === "arrow" || selectedTool === "line") &&
						element.type !== "arrow" &&
						element.type !== "line"
					) {
						// If drawing a connector and clicked an element, set it as the start point
						setIsDrawing(true);
						setDrawStart(element.position); // Or a point on the element's boundary
						setPreviewElement({
							start: { x: element.position.x, y: element.position.y },
							end: { x: element.position.x, y: element.position.y },
							type: selectedTool,
						});
					}
				}
			} else {
				// Clicked on canvas and not on an element, deselect
				setSelectedElement(null);
			}
		}
	};

	const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		const canvasPos = screenToCanvas(e.clientX, e.clientY);
		throttledUpdatePresence(canvasPos.x, canvasPos.y);

		if (isPanning) {
			const dx = e.clientX - lastPanPoint.x;
			const dy = e.clientY - lastPanPoint.y;
			setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
			setLastPanPoint({ x: e.clientX, y: e.clientY });
			return;
		}

		if (resizingElement) {
			const canvasPos = screenToCanvas(e.clientX, e.clientY);
			const dx = canvasPos.x - resizingElement.startPos.x;
			const dy = canvasPos.y - resizingElement.startPos.y;

			setElements(
				elements.map((el) => {
					if (el.id !== resizingElement.id) return el;
					if (
						el.type !== "note" &&
						el.type !== "rectangle" &&
						el.type !== "circle"
					)
						return el;

					let newWidth = resizingElement.startSize.width;
					let newHeight = resizingElement.startSize.height;
					let newX = resizingElement.startElementPos.x;
					let newY = resizingElement.startElementPos.y;

					const handle = resizingElement.handle;

					if (handle.includes("e"))
						newWidth = Math.max(50, resizingElement.startSize.width + dx);
					if (handle.includes("w")) {
						newWidth = Math.max(50, resizingElement.startSize.width - dx);
						newX =
							resizingElement.startElementPos.x +
							(resizingElement.startSize.width - newWidth);
					}
					if (handle.includes("s"))
						newHeight = Math.max(50, resizingElement.startSize.height + dy);
					if (handle.includes("n")) {
						newHeight = Math.max(50, resizingElement.startSize.height - dy);
						newY =
							resizingElement.startElementPos.y +
							(resizingElement.startSize.height - newHeight);
					}

					return {
						...el,
						position: { x: newX, y: newY },
						size: { width: newWidth, height: newHeight },
					};
				}),
			);
			return;
		}

		if (draggedElement !== null) {
			const canvasPos = screenToCanvas(e.clientX, e.clientY);
			const draggedEl = elements.find((el) => el.id === draggedElement);

			if (draggedEl?.groupId) {
				const groupElements = elements.filter(
					(el) => el.groupId === draggedEl.groupId,
				);
				const dx = canvasPos.x - dragOffset.x - draggedEl.position.x;
				const dy = canvasPos.y - dragOffset.y - draggedEl.position.y;

				setElements(
					elements.map((el) => {
						if (el.groupId !== draggedEl.groupId) return el;

						const newX = el.position.x + dx;
						const newY = el.position.y + dy;

						// For arrows and lines, also update the endPosition
						if (el.type === "arrow" || el.type === "line") {
							return {
								...el,
								position: { x: newX, y: newY },
								endPosition: {
									x: el.endPosition.x + dx,
									y: el.endPosition.y + dy,
								},
							};
						}

						return { ...el, position: { x: newX, y: newY } };
					}),
				);
			} else {
				// Original single element dragging
				setElements(
					elements.map((el) => {
						if (el.id !== draggedElement) return el;

						const newX = canvasPos.x - dragOffset.x;
						const newY = canvasPos.y - dragOffset.y;

						// For arrows and lines, also update the endPosition
						if (el.type === "arrow" || el.type === "line") {
							const dx = newX - el.position.x;
							const dy = newY - el.position.y;
							return {
								...el,
								position: { x: newX, y: newY },
								endPosition: {
									x: el.endPosition.x + dx,
									y: el.endPosition.y + dy,
								},
							};
						}

						return { ...el, position: { x: newX, y: newY } };
					}),
				);
			}
			return;
		}

		if (isDrawing && previewElement) {
			const canvasPos = screenToCanvas(e.clientX, e.clientY);
			setPreviewElement({ ...previewElement, end: canvasPos });
		}
	};

	const handleCanvasMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
		if (isPanning) {
			setIsPanning(false);
			return;
		}

		if (resizingElement) {
			setResizingElement(null);
			return;
		}

		if (isDrawing) {
			const canvasPos = screenToCanvas(e.clientX, e.clientY);

			if (selectedTool === "arrow" || selectedTool === "line") {
				// Ensure minimum length for lines/arrows
				if (
					Math.abs(canvasPos.x - drawStart.x) > 10 ||
					Math.abs(canvasPos.y - drawStart.y) > 10
				) {
					const newElement: ConnectorElement = {
						id: Date.now(),
						type: selectedTool,
						position: drawStart,
						endPosition: canvasPos,
						strokeColor: "#ffffff",
						strokeWidth: 2,
						author: "You",
						timestamp: new Date().toISOString(),
					};
					setElements([...elements, newElement]);
				}
			}

			if (selectedTool === "rectangle" || selectedTool === "circle") {
				const width = Math.abs(canvasPos.x - drawStart.x);
				const height = Math.abs(canvasPos.y - drawStart.y);

				// Ensure minimum size for shapes
				if (width > 10 || height > 10) {
					const newElement: ShapeElement = {
						id: Date.now(),
						type: selectedTool,
						position: {
							x: Math.min(drawStart.x, canvasPos.x),
							y: Math.min(drawStart.y, canvasPos.y),
						},
						size: { width: Math.max(width, 50), height: Math.max(height, 50) },
						fillColor: "transparent",
						strokeColor: "#ffffff",
						strokeWidth: 2,
						author: "You",
						timestamp: new Date().toISOString(),
					};
					setElements([...elements, newElement]);
				}
			}

			setIsDrawing(false);
			setPreviewElement(null);
			setSelectedTool("select"); // Switch back to select tool after drawing
		}

		setDraggedElement(null);
	};

	const handleElementMouseDown = (e: React.MouseEvent, elementId: number) => {
		if (selectedTool !== "select") return;
		e.stopPropagation();

		const element = elements.find((el) => el.id === elementId);
		if (!element) return;

		const canvasPos = screenToCanvas(e.clientX, e.clientY);
		setDraggedElement(elementId);
		setDragOffset({
			x: canvasPos.x - element.position.x,
			y: canvasPos.y - element.position.y,
		});
		setSelectedElement(elementId);
	};

	const handleElementDoubleClick = (e: React.MouseEvent, elementId: number) => {
		e.stopPropagation();
		const element = elements.find((el) => el.id === elementId);
		if (element && (element.type === "arrow" || element.type === "line")) {
			return; // Don't allow editing connectors
		}
		setEditingElement(elementId);
		setSelectedElement(elementId); // Ensure it's selected when editing
	};

	const handleResizeMouseDown = (
		e: React.MouseEvent,
		elementId: number,
		handle: ResizeHandle,
	) => {
		e.stopPropagation();
		const element = elements.find((el) => el.id === elementId);
		if (
			!element ||
			(element.type !== "note" &&
				element.type !== "rectangle" &&
				element.type !== "circle")
		)
			return;

		const canvasPos = screenToCanvas(e.clientX, e.clientY);
		setResizingElement({
			id: elementId,
			handle,
			startPos: canvasPos,
			startSize: element.size,
			startElementPos: element.position,
		});
	};

	const handleContentUpdate = (elementId: number, newContent: string) => {
		setElements(
			elements.map((el) => {
				if (
					el.id === elementId &&
					(el.type === "note" || el.type === "text" || el.type === "sticky")
				) {
					// Include 'sticky' type
					return { ...el, content: newContent };
				}
				return el;
			}),
		);
	};

	const handleWheel = (e: React.WheelEvent) => {
		e.preventDefault();
		const delta = e.deltaY > 0 ? -0.1 : 0.1;
		setZoom((prev) => Math.max(0.1, Math.min(3, prev + delta)));
	};

	const handleDeleteElement = (id: number) => {
		setElements(elements.filter((el) => el.id !== id));
		if (selectedElement === id) setSelectedElement(null);
	};

	const handleVote = (noteId: number) => {
		setElements(
			elements.map((el) =>
				el.id === noteId && (el.type === "note" || el.type === "sticky")
					? { ...el, votes: el.votes + 1 }
					: el,
			),
		);
	};

	const handleAddComment = (noteId: number) => {
		if (!newComment.trim()) return;

		setElements(
			elements.map((el) => {
				if (el.id === noteId && (el.type === "note" || el.type === "sticky")) {
					// Include 'sticky' type
					return {
						...el,
						comments: [
							...el.comments,
							{
								id: Date.now(),
								author: "You",
								content: newComment,
								timestamp: new Date().toISOString(),
							},
						],
					};
				}
				return el;
			}),
		);
		setNewComment("");
	};

	const applyTemplate = (
		templateType: "swot" | "retrospective" | "brainstorming",
	) => {
		let newElements: CanvasElement[] = [];

		if (!canvasRef.current) return;
		const rect = canvasRef.current.getBoundingClientRect();
		const viewportCenterX = rect.width / 2;
		const viewportCenterY = rect.height / 2;
		const canvasCenter = screenToCanvas(
			viewportCenterX + rect.left,
			viewportCenterY + rect.top,
		);

		// Use viewport center as the base position for templates
		const baseX = canvasCenter.x - 300; // Offset to center the template
		const baseY = canvasCenter.y - 200;

		const groupId = `template-${Date.now()}`;

		if (templateType === "swot") {
			// SWOT Analysis: 4 quadrants
			const spacing = 320;

			newElements = [
				// Title
				{
					id: Date.now(),
					type: "text",
					content: "SWOT Analysis",
					fontSize: 32,
					fontWeight: "bold",
					color: "#ffffff",
					position: { x: baseX + spacing, y: baseY - 80 },
					author: "Template",
					timestamp: new Date().toISOString(),
					groupId,
				},
				// Strengths
				{
					id: Date.now() + 1,
					type: "note",
					content: "Strengths\n\nWhat are we good at?",
					color: "green",
					size: { width: 280, height: 200 },
					position: { x: baseX, y: baseY },
					votes: 0,
					comments: [],
					author: "Template",
					timestamp: new Date().toISOString(),
					groupId,
				},
				// Weaknesses
				{
					id: Date.now() + 2,
					type: "note",
					content: "Weaknesses\n\nWhat can we improve?",
					color: "pink",
					size: { width: 280, height: 200 },
					position: { x: baseX + spacing, y: baseY },
					votes: 0,
					comments: [],
					author: "Template",
					timestamp: new Date().toISOString(),
					groupId,
				},
				// Opportunities
				{
					id: Date.now() + 3,
					type: "note",
					content: "Opportunities\n\nWhat possibilities exist?",
					color: "blue",
					size: { width: 280, height: 200 },
					position: { x: baseX, y: baseY + 240 },
					votes: 0,
					comments: [],
					author: "Template",
					timestamp: new Date().toISOString(),
					groupId,
				},
				// Threats
				{
					id: Date.now() + 4,
					type: "note",
					content: "Threats\n\nWhat challenges do we face?",
					color: "orange",
					size: { width: 280, height: 200 },
					position: { x: baseX + spacing, y: baseY + 240 },
					votes: 0,
					comments: [],
					author: "Template",
					timestamp: new Date().toISOString(),
					groupId,
				},
			];
		} else if (templateType === "retrospective") {
			// Retrospective: 3 columns
			const spacing = 340;

			newElements = [
				// Title
				{
					id: Date.now(),
					type: "text",
					content: "Sprint Retrospective",
					fontSize: 32,
					fontWeight: "bold",
					color: "#ffffff",
					position: { x: baseX + spacing, y: baseY - 80 },
					author: "Template",
					timestamp: new Date().toISOString(),
					groupId,
				},
				// What went well
				{
					id: Date.now() + 1,
					type: "note",
					content: "What went well? 😊\n\nAdd your positive notes here",
					color: "green",
					size: { width: 300, height: 400 },
					position: { x: baseX, y: baseY },
					votes: 0,
					comments: [],
					author: "Template",
					timestamp: new Date().toISOString(),
					groupId,
				},
				// What didn't go well
				{
					id: Date.now() + 2,
					type: "note",
					content: "What didn't go well? 🤔\n\nAdd challenges here",
					color: "orange",
					size: { width: 300, height: 400 },
					position: { x: baseX + spacing, y: baseY },
					votes: 0,
					comments: [],
					author: "Template",
					timestamp: new Date().toISOString(),
					groupId,
				},
				// Action items
				{
					id: Date.now() + 3,
					type: "note",
					content: "Action Items 🎯\n\nWhat will we do differently?",
					color: "blue",
					size: { width: 300, height: 400 },
					position: { x: baseX + spacing * 2, y: baseY },
					votes: 0,
					comments: [],
					author: "Template",
					timestamp: new Date().toISOString(),
					groupId,
				},
			];
		} else if (templateType === "brainstorming") {
			// Brainstorming: Open canvas with starter notes

			newElements = [
				// Title
				{
					id: Date.now(),
					type: "text",
					content: "Brainstorming Session",
					fontSize: 32,
					fontWeight: "bold",
					color: "#ffffff",
					position: { x: baseX + 200, y: baseY - 80 },
					author: "Template",
					timestamp: new Date().toISOString(),
					groupId,
				},
				// Central idea
				{
					id: Date.now() + 1,
					type: "note",
					content: "Main Topic\n\nWhat are we brainstorming about?",
					color: "purple",
					size: { width: 280, height: 180 },
					position: { x: baseX + 200, y: baseY + 100 },
					votes: 0,
					comments: [],
					author: "Template",
					timestamp: new Date().toISOString(),
					groupId,
				},
				// Idea 1
				{
					id: Date.now() + 2,
					type: "note",
					content: "Idea 1",
					color: "yellow",
					size: { width: 200, height: 140 },
					position: { x: baseX, y: baseY },
					votes: 0,
					comments: [],
					author: "Template",
					timestamp: new Date().toISOString(),
					groupId,
				},
				// Idea 2
				{
					id: Date.now() + 3,
					type: "note",
					content: "Idea 2",
					color: "pink",
					size: { width: 200, height: 140 },
					position: { x: baseX + 520, y: baseY },
					votes: 0,
					comments: [],
					author: "Template",
					timestamp: new Date().toISOString(),
					groupId,
				},
				// Idea 3
				{
					id: Date.now() + 4,
					type: "note",
					content: "Idea 3",
					color: "blue",
					size: { width: 200, height: 140 },
					position: { x: baseX, y: baseY + 320 },
					votes: 0,
					comments: [],
					author: "Template",
					timestamp: new Date().toISOString(),
					groupId,
				},
				// Idea 4
				{
					id: Date.now() + 5,
					type: "note",
					content: "Idea 4",
					color: "green",
					size: { width: 200, height: 140 },
					position: { x: baseX + 520, y: baseY + 320 },
					votes: 0,
					comments: [],
					author: "Template",
					timestamp: new Date().toISOString(),
					groupId,
				},
			];
		}

		setElements([...elements, ...newElements]);
		setSelectedTool("select");
	};

	const selectedElementData = elements.find((el) => el.id === selectedElement);
	const selectedNoteData = elements.find(
		(el) =>
			el.id === selectedNoteForComments &&
			(el.type === "note" || el.type === "sticky"),
	) as StickyNoteElement | undefined;

	const teamMembers = [
		{
			name: "Alice",
			avatar: "/placeholder.svg?height=32&width=32",
			status: "viewing",
		},
		{
			name: "Bob",
			avatar: "/placeholder.svg?height=32&width=32",
			status: "viewing",
		},
		{
			name: "Charlie",
			avatar: "/placeholder.svg?height=32&width=32",
			status: "away",
		},
		{
			name: "Diana",
			avatar: "/placeholder.svg?height=32&width=32",
			status: "editing",
		},
		{
			name: "Ethan",
			avatar: "/placeholder.svg?height=32&width=32",
			status: "away",
		},
	];

	const params = useParams({ from: Route.id });

	const { project } = Route.useLoaderData();

	const workspaceMembers = useQuery(api.workspace.getWorkspaceMembers);
	const activeMembers =
		useQuery(api.presence.getActiveMembers, {
			projectId: params.projectId as Id<"project">,
		}) || [];

	const updatePresence = useMutation(api.presence.updatePresence);

	const { user } = Route.useRouteContext();
	const currentMember = workspaceMembers?.members?.find(
		(m) => m.user.id === user.id,
	);

	// Throttled function to update presence (max once per 100ms)
	const throttledUpdatePresence = useCallback(
		throttle((cursorX: number, cursorY: number) => {
			if (!currentMember) return;

			updatePresence({
				projectId: params.projectId as Id<"project">,
				memberId: currentMember.id,
				cursorX,
				cursorY,
			});
		}, 100),
		[currentMember, params.projectId, updatePresence],
	);

	// Convert activePresence to LiveCursor format
	const liveCursors = useMemo<LiveCursor[]>(() => {
		if (!workspaceMembers?.members) return [];

		return activeMembers
			.filter((p) => p.memberId !== currentMember?.id) // Don't show your own cursor
			.map((presence) => {
				const member = workspaceMembers.members.find(
					(m) => m.id === presence.memberId,
				);
				if (!member) return null;

				return {
					id: presence.memberId,
					name: member.user.name,
					color: generateColorFromId(presence.memberId),
					position: {
						x: presence.cursorX ?? 0,
						y: presence.cursorY ?? 0,
					},
				};
			})
			.filter((cursor): cursor is LiveCursor => cursor !== null);
	}, [activeMembers, workspaceMembers, currentMember?.id]);

	const activeMembersList =
		workspaceMembers?.members?.filter((member) =>
			activeMembers.find((activeMember) => activeMember.memberId === member.id),
		) || [];

	const visibleMembers = activeMembersList.slice(0, 3);
	const remainingCount =
		(workspaceMembers?.members?.length || 0) - visibleMembers.length;

	// Heartbeat to keep presence alive even without mouse movement
	useEffect(() => {
		if (!currentMember) return;

		const heartbeat = setInterval(() => {
			updatePresence({
				projectId: params.projectId as Id<"project">,
				memberId: currentMember.id,
			});
		}, 15000);

		return () => clearInterval(heartbeat);
	}, [currentMember, params.projectId, updatePresence]);

	// Clean up presence when leaving the page
	const removePresence = useMutation(api.presence.removePresence);
	useEffect(() => {
		return () => {
			if (currentMember) {
				removePresence({
					projectId: params.projectId as Id<"project">,
				});
			}
		};
	}, [currentMember, params.projectId, removePresence]);

	return (
		<div className="h-screen flex flex-col bg-background">
			{/* Top Bar - Hidden in focus mode */}
			{!isFocusMode && (
				<header className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0">
					<div className="flex items-center gap-4">
						<Link
							to={`/dashboard/project/$projectId`}
							params={{ projectId: params.projectId }}
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
										<AvatarImage
											src={member.user.image || "/placeholder.svg"}
										/>
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
			)}

			{/* Main Content */}
			<div className="flex-1 flex overflow-hidden">
				{/* Canvas Area */}
				<div
					ref={canvasRef}
					className="flex-1 relative overflow-hidden bg-muted/20"
					onMouseDown={handleCanvasMouseDown}
					onMouseMove={handleCanvasMouseMove}
					onMouseUp={handleCanvasMouseUp}
					onWheel={handleWheel}
					style={{
						cursor:
							isPanning || selectedTool === "hand"
								? "grab"
								: selectedTool === "select"
									? "default"
									: "crosshair",
					}}
				>
					{/* Grid pattern background */}
					<div
						className="absolute inset-0 opacity-[0.03] pointer-events-none"
						style={{
							backgroundImage: `
                  linear-gradient(to right, currentColor 1px, transparent 1px),
                  linear-gradient(to bottom, currentColor 1px, transparent 1px)
                `,
							backgroundSize: `${40 * zoom}px ${40 * zoom}px`,
							backgroundPosition: `${pan.x}px ${pan.y}px`,
						}}
					/>

					{/* Canvas content with zoom and pan */}
					<div
						className="absolute inset-0 canvas-background"
						style={{
							transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
							transformOrigin: "0 0",
						}}
					>
						{/* Render all elements */}
						{elements.map((element) => {
							const elementKey = element.id;
							const commonProps = {
								"data-element-id": element.id,
							};

							if (element.type === "note" || element.type === "sticky") {
								const colors = getColorClasses(element.color);
								const isSelected = selectedElement === element.id;
								const isEditing = editingElement === element.id;

								return (
									<div
										key={elementKey}
										{...commonProps}
										className={`absolute p-4 rounded shadow-md hover:shadow-xl transition-all group ${
											isSelected ? "ring-2 ring-primary ring-offset-2" : ""
										}`}
										style={{
											left: element.position.x,
											top: element.position.y,
											width: element.size.width,
											height: element.size.height,
											cursor: selectedTool === "select" ? "move" : "default",
											backgroundColor:
												element.color === "yellow"
													? "#fef3c7"
													: element.color === "pink"
														? "#fce7f3"
														: element.color === "blue"
															? "#dbeafe"
															: element.color === "green"
																? "#d1fae5"
																: element.color === "purple"
																	? "#e9d5ff"
																	: element.color === "orange"
																		? "#fed7aa"
																		: "#fef3c7",
											color:
												element.color === "yellow"
													? "#78350f"
													: element.color === "pink"
														? "#831843"
														: element.color === "blue"
															? "#1e3a8a"
															: element.color === "green"
																? "#064e3b"
																: element.color === "purple"
																	? "#581c87"
																	: element.color === "orange"
																		? "#7c2d12"
																		: "#78350f",
											boxShadow:
												"0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)",
											transform: "rotate(-0.5deg)",
											fontFamily:
												"'Comic Sans MS', 'Marker Felt', cursive, sans-serif",
										}}
										onMouseDown={(e) => handleElementMouseDown(e, element.id)}
										onDoubleClick={(e) =>
											handleElementDoubleClick(e, element.id)
										}
									>
										<div className="flex items-start justify-between mb-2">
											<div className="flex items-center gap-2">
												<Avatar className="w-6 h-6">
													<AvatarFallback className="text-xs">
														{element.author[0]}
													</AvatarFallback>
												</Avatar>
												<span className="text-xs opacity-70">
													{element.author}
												</span>
											</div>
											<Button
												variant="ghost"
												size="icon"
												className="h-6 w-6 opacity-0 group-hover:opacity-100"
												onClick={(e) => {
													e.stopPropagation();
													handleDeleteElement(element.id);
												}}
											>
												<Trash2 className="w-3 h-3" />
											</Button>
										</div>

										{isEditing ? (
											<textarea
												className="w-full text-sm leading-relaxed mb-3 bg-transparent border-none outline-none resize-none overflow-auto"
												style={{
													height: element.size.height - 100,
													color: "inherit",
													fontFamily: "inherit",
												}}
												value={element.content}
												onChange={(e) =>
													handleContentUpdate(element.id, e.target.value)
												}
												onBlur={() => setEditingElement(null)}
												// autoFocus
												onClick={(e) => e.stopPropagation()}
											/>
										) : (
											<p
												className="text-sm leading-relaxed mb-3 overflow-auto whitespace-pre-wrap"
												style={{ maxHeight: element.size.height - 100 }}
											>
												{element.content}
											</p>
										)}

										<div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs">
											<div className="flex items-center gap-3">
												<button
													type="button"
													onClick={(e) => {
														e.stopPropagation();
														handleVote(element.id);
													}}
													className="flex items-center gap-1 hover:text-primary transition-colors"
												>
													<ThumbsUp className="w-3 h-3" />
													<span>{element.votes}</span>
												</button>
												<button
													type="button"
													onClick={(e) => {
														e.stopPropagation();
														setSelectedNoteForComments(element.id);
														setCommentsDialogOpen(true);
													}}
													className="flex items-center gap-1 hover:text-primary transition-colors"
												>
													<MessageSquare className="w-3 h-3" />
													<span>{element.comments.length}</span>
												</button>
											</div>
											<span className="opacity-60">{element.timestamp}</span>
										</div>

										<ResizeHandles
											element={element}
											handleResizeMouseDown={handleResizeMouseDown}
											selectedElement={selectedElement}
										/>
									</div>
								);
							}

							if (element.type === "text") {
								const isSelected = selectedElement === element.id;
								const isEditing = editingElement === element.id;

								return (
									<div
										key={elementKey}
										{...commonProps}
										className={`absolute px-2 py-1 ${isSelected ? "ring-2 ring-primary ring-offset-2 rounded" : ""}`}
										style={{
											left: element.position.x,
											top: element.position.y,
											fontSize: element.fontSize,
											fontWeight: element.fontWeight,
											color: element.color,
											cursor: selectedTool === "select" ? "move" : "default",
											minWidth: element.fontSize > 20 ? "300px" : "100px",
											maxWidth: "600px",
										}}
										onMouseDown={(e) => handleElementMouseDown(e, element.id)}
										onDoubleClick={(e) =>
											handleElementDoubleClick(e, element.id)
										}
									>
										{isEditing ? (
											<textarea
												className="bg-transparent border border-border rounded px-2 py-1 outline-none min-w-[100px] resize-none overflow-hidden"
												style={{
													fontSize: element.fontSize,
													fontWeight: element.fontWeight,
													color: element.color,
													whiteSpace: "pre-wrap",
												}}
												value={element.content}
												onChange={(e) => {
													handleContentUpdate(element.id, e.target.value);
													// Auto-resize textarea to fit content
													e.target.style.height = "auto";
													e.target.style.height = e.target.scrollHeight + "px";
												}}
												onBlur={() => setEditingElement(null)}
												onClick={(e) => e.stopPropagation()}
												rows={1}
												ref={(el) => {
													if (el && isEditing) {
														el.focus();
														el.style.height = "auto";
														el.style.height = el.scrollHeight + "px";
														// Move cursor to end
														el.setSelectionRange(
															el.value.length,
															el.value.length,
														);
													}
												}}
											/>
										) : (
											<div
												style={{
													whiteSpace: "pre-wrap",
													wordBreak: "break-word",
												}}
											>
												{element.content}
											</div>
										)}
									</div>
								);
							}

							if (element.type === "rectangle") {
								const isSelected = selectedElement === element.id;
								return (
									<div
										key={elementKey}
										{...commonProps}
										className={`absolute ${isSelected ? "ring-2 ring-primary ring-offset-2" : ""}`}
										style={{
											left: element.position.x,
											top: element.position.y,
											width: element.size.width,
											height: element.size.height,
											backgroundColor: element.fillColor,
											border: `${element.strokeWidth}px solid ${element.strokeColor}`,
											borderRadius: "8px",
											cursor: selectedTool === "select" ? "move" : "default",
										}}
										onMouseDown={(e) => handleElementMouseDown(e, element.id)}
									>
										<ResizeHandles
											element={element}
											handleResizeMouseDown={handleResizeMouseDown}
											selectedElement={selectedElement}
										/>
									</div>
								);
							}

							if (element.type === "circle") {
								const isSelected = selectedElement === element.id;
								return (
									<div
										key={elementKey}
										{...commonProps}
										className={`absolute ${isSelected ? "ring-2 ring-primary ring-offset-2" : ""}`}
										style={{
											left: element.position.x,
											top: element.position.y,
											width: element.size.width,
											height: element.size.height,
											backgroundColor: element.fillColor,
											border: `${element.strokeWidth}px solid ${element.strokeColor}`,
											borderRadius: "50%",
											cursor: selectedTool === "select" ? "move" : "default",
										}}
										onMouseDown={(e) => handleElementMouseDown(e, element.id)}
									>
										<ResizeHandles
											element={element}
											handleResizeMouseDown={handleResizeMouseDown}
											selectedElement={selectedElement}
										/>
									</div>
								);
							}

							if (element.type === "arrow" || element.type === "line") {
								const isSelected = selectedElement === element.id;
								const dx = element.endPosition.x - element.position.x;
								const dy = element.endPosition.y - element.position.y;
								const length = Math.sqrt(dx * dx + dy * dy);
								const angle = Math.atan2(dy, dx) * (180 / Math.PI);

								return (
									<div
										key={elementKey}
										{...commonProps}
										className={`absolute ${isSelected ? "ring-2 ring-primary ring-offset-2" : ""}`}
										style={{
											left: element.position.x,
											top: element.position.y,
											width: length,
											height: element.strokeWidth,
											backgroundColor: element.strokeColor,
											transform: `rotate(${angle}deg)`,
											transformOrigin: "0 50%",
											cursor: selectedTool === "select" ? "move" : "default",
										}}
										onMouseDown={(e) => handleElementMouseDown(e, element.id)}
									>
										{element.type === "arrow" && (
											<div
												className="absolute right-0 top-1/2 -translate-y-1/2"
												style={{
													width: 0,
													height: 0,
													borderLeft: `10px solid ${element.strokeColor}`,
													borderTop: "6px solid transparent",
													borderBottom: "6px solid transparent",
												}}
											/>
										)}
									</div>
								);
							}

							return null;
						})}

						{previewElement && (
							<>
								{(previewElement.type === "rectangle" ||
									previewElement.type === "circle") && (
									<div
										className="absolute opacity-50"
										style={{
											left: Math.min(
												previewElement.start.x,
												previewElement.end.x,
											),
											top: Math.min(
												previewElement.start.y,
												previewElement.end.y,
											),
											width: Math.abs(
												previewElement.end.x - previewElement.start.x,
											),
											height: Math.abs(
												previewElement.end.y - previewElement.start.y,
											),
											border: "2px dashed #ffffff",
											borderRadius:
												previewElement.type === "circle" ? "50%" : "8px",
											pointerEvents: "none",
										}}
									/>
								)}
								{(previewElement.type === "arrow" ||
									previewElement.type === "line") && (
									<div
										className="absolute opacity-50"
										style={{
											left: previewElement.start.x,
											top: previewElement.start.y,
											width: Math.sqrt(
												Math.pow(
													previewElement.end.x - previewElement.start.x,
													2,
												) +
													Math.pow(
														previewElement.end.y - previewElement.start.y,
														2,
													),
											),
											height: 2,
											backgroundColor: "#ffffff",
											transform: `rotate(${
												Math.atan2(
													previewElement.end.y - previewElement.start.y,
													previewElement.end.x - previewElement.start.x,
												) *
												(180 / Math.PI)
											}deg)`,
											transformOrigin: "0 50%",
											pointerEvents: "none",
										}}
									>
										{previewElement.type === "arrow" && (
											<div
												className="absolute right-0 top-1/2 -translate-y-1/2"
												style={{
													width: 0,
													height: 0,
													borderLeft: "10px solid #ffffff",
													borderTop: "6px solid transparent",
													borderBottom: "6px solid transparent",
												}}
											/>
										)}
									</div>
								)}
							</>
						)}

						{liveCursors.map((cursor) => (
							<div
								key={cursor.id}
								className="absolute pointer-events-none transition-all duration-200"
								style={{
									left: cursor.position.x,
									top: cursor.position.y,
									color: cursor.color,
								}}
							>
								<MousePointer2 className="w-5 h-5" fill={cursor.color} />
								<div
									className="mt-1 px-2 py-0.5 rounded text-xs font-medium text-white whitespace-nowrap"
									style={{ backgroundColor: cursor.color }}
								>
									{cursor.name}
								</div>
							</div>
						))}
					</div>

					{/* Zoom Controls */}
					{!isFocusMode && (
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
					)}

					{/* Toolbar - Hidden in focus mode */}
					{!isFocusMode && (
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
									<DropdownMenuItem
										onClick={() => applyTemplate("retrospective")}
									>
										<StickyNote className="w-4 h-4 mr-2" />
										Retrospective
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => applyTemplate("brainstorming")}
									>
										<Sparkles className="w-4 h-4 mr-2" />
										Brainstorming
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					)}

					{isFocusMode && (
						<div className="absolute top-6 right-6 bg-card border border-border rounded-lg shadow-lg">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setIsFocusMode(false)}
							>
								<X className="w-4 h-4 mr-2" />
								Exit Focus Mode
							</Button>
						</div>
					)}
				</div>

				{/* AI Summary Sidebar - Hidden in focus mode */}
				{showAISummary && !isFocusMode && (
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
										actively collaborating with {liveCursors.length} members
										online.
									</p>
								</div>

								<Separator />

								<div>
									<h3 className="text-sm font-semibold mb-2">
										Top Voted Ideas
									</h3>
									<div className="space-y-2">
										{elements
											.filter(
												(el): el is StickyNoteElement =>
													el.type === "note" || el.type === "sticky",
											) // Filter for note or sticky
											.sort((a, b) => b.votes - a.votes)
											.slice(0, 3)
											.map((note) => (
												<div
													key={note.id}
													className="text-sm p-2 rounded bg-muted/50 cursor-pointer hover:bg-muted"
													onClick={() => setSelectedElement(note.id)}
												>
													<div className="flex items-center gap-2 mb-1">
														<ThumbsUp className="w-3 h-3" />
														<span className="font-medium">
															{note.votes} votes
														</span>
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
								>
									<Sparkles className="w-4 h-4 mr-2" />
									Generate Summary
								</Button>
							</div>
						</ScrollArea>
					</div>
				)}
			</div>

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
							{workspaceMembers?.members?.map((member, idx) => (
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
											<Badge
												variant="outline"
												className="text-muted-foreground"
											>
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

			<Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Share Decision Board</DialogTitle>
						<DialogDescription>
							Share this board with your team members
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="share-link">Share Link</Label>
							<div className="flex gap-2">
								<Input
									id={"share-link"}
									value={`https://yourapp.com/board/${params.projectId}`}
									readOnly
									className="font-mono text-sm"
								/>
								<Button
									variant="outline"
									onClick={() => {
										navigator.clipboard.writeText(
											`https://yourapp.com/board/${params.projectId}`,
										);
									}}
								>
									Copy
								</Button>
							</div>
						</div>
						<Separator />
						<div className="space-y-2">
							<Label>Invite by Email</Label>
							<div className="flex gap-2">
								<Input placeholder="colleague@example.com" type="email" />
								<Button>
									<Send className="w-4 h-4 mr-2" />
									Invite
								</Button>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Comments Dialog */}
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
		</div>
	);
}
