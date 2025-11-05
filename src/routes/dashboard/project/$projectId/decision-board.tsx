import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import type React from "react";
import { useState, useRef, useEffect } from "react";
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
} from "lucide-react";

type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

type ElementType = "note" | "text" | "rectangle" | "circle" | "arrow" | "line";

type BaseElement = {
	id: number;
	type: ElementType;
	position: { x: number; y: number };
	author: string;
	timestamp: string;
};

type StickyNoteElement = BaseElement & {
	type: "note";
	content: string;
	color: string;
	size: { width: number; height: number };
	votes: number;
	comments: Comment[];
};

type TextElement = BaseElement & {
	type: "text";
	content: string;
	fontSize: number;
	fontWeight: "normal" | "bold";
	color: string;
};

type ShapeElement = BaseElement & {
	type: "rectangle" | "circle";
	size: { width: number; height: number };
	fillColor: string;
	strokeColor: string;
	strokeWidth: number;
};

type ConnectorElement = BaseElement & {
	type: "arrow" | "line";
	endPosition: { x: number; y: number };
	strokeColor: string;
	strokeWidth: number;
};

type CanvasElement =
	| StickyNoteElement
	| TextElement
	| ShapeElement
	| ConnectorElement;

type Comment = {
	id: number;
	author: string;
	content: string;
	timestamp: string;
};

type LiveCursor = {
	id: string;
	name: string;
	color: string;
	position: { x: number; y: number };
};

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

export const Route = createFileRoute(
	"/dashboard/project/$projectId/decision-board",
)({
	component: RouteComponent,
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

	const [liveCursors, setLiveCursors] = useState<LiveCursor[]>([
		{
			id: "user1",
			name: "Alice",
			color: "#3b82f6",
			position: { x: 400, y: 300 },
		},
		{
			id: "user2",
			name: "Bob",
			color: "#10b981",
			position: { x: 600, y: 400 },
		},
	]);

	const [selectedTool, setSelectedTool] = useState<
		ElementType | "select" | "hand"
	>("select");
	const [selectedElement, setSelectedElement] = useState<number | null>(null);
	const [editingElement, setEditingElement] = useState<number | null>(null);
	const [zoom, setZoom] = useState(1);
	const [pan, setPan] = useState({ x: 0, y: 0 });
	const [isPanning, setIsPanning] = useState(false);
	const [panStart, setPanStart] = useState({ x: 0, y: 0 });
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

	const canvasRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const interval = setInterval(() => {
			setLiveCursors((cursors) =>
				cursors.map((cursor) => ({
					...cursor,
					position: {
						x: cursor.position.x + (Math.random() - 0.5) * 50,
						y: cursor.position.y + (Math.random() - 0.5) * 50,
					},
				})),
			);
		}, 2000);

		return () => clearInterval(interval);
	}, []);

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

	const handleCanvasMouseDown = (e: React.MouseEvent) => {
		if (
			e.button === 1 ||
			selectedTool === "hand" ||
			(e.button === 0 &&
				selectedTool === "select" &&
				e.target === canvasRef.current)
		) {
			setIsPanning(true);
			setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
			return;
		}

		const canvasPos = screenToCanvas(e.clientX, e.clientY);

		// Start drawing connector or shape
		if (
			selectedTool === "arrow" ||
			selectedTool === "line" ||
			selectedTool === "rectangle" ||
			selectedTool === "circle"
		) {
			setIsDrawing(true);
			setDrawStart(canvasPos);
			setPreviewElement({
				start: canvasPos,
				end: canvasPos,
				type: selectedTool,
			});
		}

		// Add text or note
		if (selectedTool === "text") {
			const newElement: TextElement = {
				id: Date.now(),
				type: "text",
				content: "Double-click to edit",
				fontSize: 16,
				fontWeight: "normal",
				color: "#ffffff",
				position: canvasPos,
				author: "You",
				timestamp: "Just now",
			};
			setElements([...elements, newElement]);
			setSelectedTool("select");
			setSelectedElement(newElement.id);
			setEditingElement(newElement.id);
		}

		if (selectedTool === "note") {
			const newElement: StickyNoteElement = {
				id: Date.now(),
				type: "note",
				content: "Double-click to edit",
				color: "yellow",
				size: { width: 240, height: 160 },
				position: canvasPos,
				votes: 0,
				comments: [],
				author: "You",
				timestamp: "Just now",
			};
			setElements([...elements, newElement]);
			setSelectedTool("select");
			setSelectedElement(newElement.id);
			setEditingElement(newElement.id);
		}
	};

	const handleCanvasMouseMove = (e: React.MouseEvent) => {
		if (isPanning) {
			setPan({
				x: e.clientX - panStart.x,
				y: e.clientY - panStart.y,
			});
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
			return;
		}

		if (isDrawing && previewElement) {
			const canvasPos = screenToCanvas(e.clientX, e.clientY);
			setPreviewElement({ ...previewElement, end: canvasPos });
		}
	};

	const handleCanvasMouseUp = (e: React.MouseEvent) => {
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
				const newElement: ConnectorElement = {
					id: Date.now(),
					type: selectedTool,
					position: drawStart,
					endPosition: canvasPos,
					strokeColor: "#ffffff",
					strokeWidth: 2,
					author: "You",
					timestamp: "Just now",
				};
				setElements([...elements, newElement]);
			}

			if (selectedTool === "rectangle" || selectedTool === "circle") {
				const width = Math.abs(canvasPos.x - drawStart.x);
				const height = Math.abs(canvasPos.y - drawStart.y);
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
					timestamp: "Just now",
				};
				setElements([...elements, newElement]);
			}

			setIsDrawing(false);
			setPreviewElement(null);
			setSelectedTool("select");
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
		setEditingElement(elementId);
		setSelectedElement(elementId);
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
				if (el.id === elementId && (el.type === "note" || el.type === "text")) {
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
				el.id === noteId && el.type === "note"
					? { ...el, votes: el.votes + 1 }
					: el,
			),
		);
	};

	const handleAddComment = (noteId: number) => {
		if (!newComment.trim()) return;

		setElements(
			elements.map((el) => {
				if (el.id === noteId && el.type === "note") {
					return {
						...el,
						comments: [
							...el.comments,
							{
								id: Date.now(),
								author: "You",
								content: newComment,
								timestamp: "Just now",
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

		if (templateType === "swot") {
			// SWOT Analysis: 4 quadrants
			const baseX = 300;
			const baseY = 200;
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
					timestamp: "Just now",
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
					timestamp: "Just now",
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
					timestamp: "Just now",
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
					timestamp: "Just now",
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
					timestamp: "Just now",
				},
			];
		} else if (templateType === "retrospective") {
			// Retrospective: 3 columns
			const baseX = 200;
			const baseY = 200;
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
					timestamp: "Just now",
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
					timestamp: "Just now",
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
					timestamp: "Just now",
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
					timestamp: "Just now",
				},
			];
		} else if (templateType === "brainstorming") {
			// Brainstorming: Open canvas with starter notes
			const baseX = 300;
			const baseY = 200;

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
					timestamp: "Just now",
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
					timestamp: "Just now",
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
					timestamp: "Just now",
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
					timestamp: "Just now",
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
					timestamp: "Just now",
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
					timestamp: "Just now",
				},
			];
		}

		setElements([...elements, ...newElements]);
		setSelectedTool("select");
	};

	const selectedElementData = elements.find((el) => el.id === selectedElement);
	const selectedNoteData = elements.find(
		(el) => el.id === selectedNoteForComments && el.type === "note",
	) as StickyNoteElement | undefined;

	const teamMembers = [
		{
			name: "Alice",
			avatar: "/placeholder.svg?height=32&width=32",
			status: "online",
		},
		{
			name: "Bob",
			avatar: "/placeholder.svg?height=32&width=32",
			status: "online",
		},
		{
			name: "Charlie",
			avatar: "/placeholder.svg?height=32&width=32",
			status: "offline",
		},
	];

	const ResizeHandles = ({ element }: { element: CanvasElement }) => {
		if (
			element.type !== "note" &&
			element.type !== "rectangle" &&
			element.type !== "circle"
		)
			return null;
		if (selectedElement !== element.id) return null;

		const handles: ResizeHandle[] = [
			"nw",
			"n",
			"ne",
			"e",
			"se",
			"s",
			"sw",
			"w",
		];
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

	return (
		<div className="h-screen flex flex-col bg-background">
			{/* Top Bar - Hidden in focus mode */}
			{!isFocusMode && (
				<header className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0">
					<div className="flex items-center gap-4">
						<Link href={`/dashboard/project/${params.id}`}>
							<Button variant="ghost" size="icon">
								<ArrowLeft className="w-5 h-5" />
							</Button>
						</Link>
						<div>
							<h1 className="font-semibold">Product Roadmap Q1</h1>
							<p className="text-xs text-muted-foreground">Decision Board</p>
						</div>
					</div>

					<div className="flex items-center gap-2">
						{/* Team Avatars */}
						<div className="flex items-center -space-x-2 mr-2">
							{teamMembers.map((member, idx) => (
								<div key={idx} className="relative">
									<Avatar className="w-8 h-8 border-2 border-background">
										<AvatarImage src={member.avatar || "/placeholder.svg"} />
										<AvatarFallback>{member.name[0]}</AvatarFallback>
									</Avatar>
									{member.status === "online" && (
										<span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
									)}
								</div>
							))}
						</div>

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

						<Button variant="outline" size="sm">
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
								<DropdownMenuItem>
									<Users className="w-4 h-4 mr-2" />
									Manage members
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
						className="absolute inset-0"
						style={{
							transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
							transformOrigin: "0 0",
						}}
					>
						{/* Render all elements */}
						{elements.map((element) => {
							if (element.type === "note") {
								const colors = getColorClasses(element.color);
								const isSelected = selectedElement === element.id;
								const isEditing = editingElement === element.id;

								return (
									<div
										key={element.id}
										className={`absolute p-4 rounded-lg border-2 ${colors.bg} ${colors.border} ${colors.text} shadow-sm hover:shadow-lg transition-all group ${
											isSelected ? "ring-2 ring-primary ring-offset-2" : ""
										}`}
										style={{
											left: element.position.x,
											top: element.position.y,
											width: element.size.width,
											height: element.size.height,
											cursor: selectedTool === "select" ? "move" : "default",
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
												className="w-full text-sm leading-relaxed mb-3 bg-transparent border-none outline-none resize-none"
												style={{
													height: element.size.height - 100,
													color: "inherit",
												}}
												value={element.content}
												onChange={(e) =>
													handleContentUpdate(element.id, e.target.value)
												}
												onBlur={() => setEditingElement(null)}
												autoFocus
												onClick={(e) => e.stopPropagation()}
											/>
										) : (
											<p
												className="text-sm leading-relaxed mb-3 overflow-auto"
												style={{ maxHeight: element.size.height - 100 }}
											>
												{element.content}
											</p>
										)}

										<div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs">
											<div className="flex items-center gap-3">
												<button
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

										<ResizeHandles element={element} />
									</div>
								);
							}

							if (element.type === "text") {
								const isSelected = selectedElement === element.id;
								const isEditing = editingElement === element.id;

								return (
									<div
										key={element.id}
										className={`absolute px-2 py-1 ${isSelected ? "ring-2 ring-primary ring-offset-2 rounded" : ""}`}
										style={{
											left: element.position.x,
											top: element.position.y,
											fontSize: element.fontSize,
											fontWeight: element.fontWeight,
											color: element.color,
											cursor: selectedTool === "select" ? "move" : "default",
											minWidth: "100px",
										}}
										onMouseDown={(e) => handleElementMouseDown(e, element.id)}
										onDoubleClick={(e) =>
											handleElementDoubleClick(e, element.id)
										}
									>
										{isEditing ? (
											<div
												contentEditable
												suppressContentEditableWarning
												className="bg-transparent border-none outline-none min-w-[100px] whitespace-pre-wrap"
												style={{
													fontSize: element.fontSize,
													fontWeight: element.fontWeight,
													color: element.color,
												}}
												onInput={(e) =>
													handleContentUpdate(
														element.id,
														e.currentTarget.textContent || "",
													)
												}
												onBlur={() => setEditingElement(null)}
												onClick={(e) => e.stopPropagation()}
												ref={(el) => {
													if (el && isEditing) {
														el.focus();
														// Move cursor to end
														const range = document.createRange();
														const sel = window.getSelection();
														range.selectNodeContents(el);
														range.collapse(false);
														sel?.removeAllRanges();
														sel?.addRange(range);
													}
												}}
											>
												{element.content}
											</div>
										) : (
											<div className="whitespace-pre-wrap">
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
										key={element.id}
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
										<ResizeHandles element={element} />
									</div>
								);
							}

							if (element.type === "circle") {
								const isSelected = selectedElement === element.id;
								return (
									<div
										key={element.id}
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
										<ResizeHandles element={element} />
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
										key={element.id}
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
												(el): el is StickyNoteElement => el.type === "note",
											)
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
