import { createFileRoute, redirect, useParams } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import {
	MessageSquare,
	MousePointer2,
	ThumbsUp,
	Trash2,
	X,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import AISummarySidebar from "@/components/dashboard/decision-board/ai-summary";
import DecisionBoardComments from "@/components/dashboard/decision-board/comments-dialog";
import DecisionBoardMembersDialog from "@/components/dashboard/decision-board/members-dialog";
import ResizeHandles from "@/components/dashboard/decision-board/resize-handles";
import DecisionBoardSharedialog from "@/components/dashboard/decision-board/share-dialog";
import DecisionBoardToolbar from "@/components/dashboard/decision-board/toolbar";
import DecisionBoardTopbar from "@/components/dashboard/decision-board/topbar";
import DecisionBoardZoomControls from "@/components/dashboard/decision-board/zoom-controls";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getColorClasses, getStickyNoteColors } from "@/lib/common/colors";
import { formatDateSince, generateColorFromId } from "@/lib/common/helper";
import type {
	BoardElement,
	ElementType,
	LiveCursor,
	ResizeHandle,
} from "@/lib/common/types";

// Debounce utility to delay execution until activity settles
function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number,
): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout | null = null;

	return function debouncedFunction(...args: Parameters<T>) {
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(() => {
			timeout = null;
			func(...args);
		}, wait);
	};
}

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
		} catch (error: unknown) {
			throw redirect({ to: "/dashboard" });
		}
	},
});

function RouteComponent() {
	const params = useParams({ from: Route.id });

	const elements =
		useQuery(api.element.getElements, {
			projectId: params.projectId as Id<"project">,
		}) || [];

	const [localElements, setLocalElements] = useState<typeof elements>([]);
	const [selectedTool, setSelectedTool] = useState<
		ElementType | "select" | "hand"
	>("select");
	const [selectedElement, setSelectedElement] = useState<Id<"element"> | null>(
		null,
	);
	const [editingElement, setEditingElement] = useState<Id<"element"> | null>(
		null,
	);
	const [zoom, setZoom] = useState(1);
	const [pan, setPan] = useState({ x: 0, y: 0 });
	const [isPanning, setIsPanning] = useState(false);
	const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 }); // Renamed from panStart for clarity
	const [draggedElement, setDraggedElement] = useState<Id<"element"> | null>(
		null,
	);
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
	const [isDrawing, setIsDrawing] = useState(false);
	const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
	const [previewElement, setPreviewElement] = useState<{
		start: { x: number; y: number };
		end: { x: number; y: number };
		type: ElementType;
	} | null>(null);
	const [resizingElement, setResizingElement] = useState<{
		id: Id<"element">;
		handle: ResizeHandle;
		startPos: { x: number; y: number };
		startSize: { width: number; height: number };
		startElementPos: { x: number; y: number };
	} | null>(null);
	const [showAISummary, setShowAISummary] = useState(false);
	const [isFocusMode, setIsFocusMode] = useState(false);

	const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
	const [selectedNoteForComments, setSelectedNoteForComments] =
		useState<Id<"element"> | null>(null);
	const [newComment, setNewComment] = useState("");
	const [membersDialogOpen, setMembersDialogOpen] = useState(false);
	const [shareDialogOpen, setShareDialogOpen] = useState(false);

	const canvasRef = useRef<HTMLDivElement>(null);

	// Helper function to check if an ID is a temporary ID
	const isTempId = useCallback((id: Id<"element"> | string): boolean => {
		return String(id).startsWith("temp-id-");
	}, []);

	const isEditingElement = useCallback(
		(id: Id<"element">) => editingElement === id,
		[editingElement],
	);

	// Use refs to track previous values and prevent unnecessary updates
	const prevElementsRef = useRef<typeof elements>([]);
	const prevEditingElementRef = useRef<Id<"element"> | null>(null);

	useEffect(() => {
		// Check if elements actually changed by comparing IDs
		const elementsChanged =
			elements.length !== prevElementsRef.current.length ||
			elements.some(
				(el, idx) =>
					prevElementsRef.current[idx]?._id !== el._id ||
					prevElementsRef.current[idx]?._creationTime !== el._creationTime,
			);

		const editingElementChanged =
			editingElement !== prevEditingElementRef.current;

		// Only update if something actually changed
		if (!elementsChanged && !editingElementChanged) {
			return;
		}

		// Update refs
		prevElementsRef.current = elements;
		prevEditingElementRef.current = editingElement;

		setLocalElements((prev) => {
			const prevById = new Map(prev.map((el) => [el._id, el]));
			const serverById = new Map(elements.map((el) => [el._id, el]));

			const merged = elements.map((serverEl) => {
				const localEl = prevById.get(serverEl._id);
				
				// Preserve local element if it's being edited
				if (editingElement && serverEl._id === editingElement) {
					return localEl ?? serverEl;
				}
				
				// Preserve local element if it has different content (unsaved changes)
				// This prevents content from reverting when blur happens before server update completes
				if (localEl && (localEl.content ?? "") !== (serverEl.content ?? "")) {
					return localEl;
				}
				
				return serverEl;
			});

			prev.forEach((localEl) => {
				const existsOnServer = serverById.has(localEl._id);
				const isEditing = editingElement === localEl._id;
				const hasTempId = isTempId(localEl._id);

				if (!existsOnServer && (isEditing || hasTempId)) {
					merged.push(localEl);
				}
			});

			return merged;
		});
	}, [elements, editingElement, isTempId]);

	// // Convert Convex DB shape → current UI element shape
	// const normalizedElements = useMemo(() => {
	// 	return (elements || []).map((e) => ({
	// 		...e,
	// 		position: { x: e.x, y: e.y },
	// 		size:
	// 			e.width && e.height ? { width: e.width, height: e.height } : undefined,
	// 		endPosition: e.endX && e.endY ? { x: e.endX, y: e.endY } : undefined,
	// 	}));
	// }, [elements]);

	const insertElement = useMutation(api.element.insertElement);
	const updateElement = useMutation(api.element.updateElement);
	const deleteElement = useMutation(api.element.deleteElement);

	const addComment = useMutation(api.element.addComment);
	const toggleVote = useMutation(api.element.toggleVote);

	type UpdateElementArgs = Parameters<typeof updateElement>[0];
	type Patch = UpdateElementArgs["patch"];

	const debouncedElementUpdate = useMemo(() => {
		return debounce(async (id: Id<"element">, patch: Patch) => {
			// Skip update if ID is temporary (not yet saved to database)
			if (isTempId(id)) {
				return;
			}
			try {
				await updateElement({
					projectId: params.projectId as Id<"project">,
					id,
					patch,
				});
			} catch (error) {
				if (error instanceof ConvexError) {
					console.error("Failed to update element:", error.data);
				} else {
					console.error("Failed to update element:", error);
				}
			}
		}, 250);
	}, [updateElement, params.projectId, isTempId]);

	const screenToCanvas = (screenX: number, screenY: number) => {
		if (!canvasRef.current) return { x: 0, y: 0 };
		const rect = canvasRef.current.getBoundingClientRect();
		return {
			x: (screenX - rect.left - pan.x) / zoom,
			y: (screenY - rect.top - pan.y) / zoom,
		};
	};

	const handleCanvasMouseDown = async (e: React.MouseEvent<HTMLDivElement>) => {
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
				const now = Date.now();

				const newElement: Omit<
					BoardElement,
					"_id" | "_creationTime" | "createdAt" | "updatedAt"
				> = {
					projectId: params.projectId as Id<"project">,
					elementType: "text",
					x: canvasPos.x,
					y: canvasPos.y,
					content: "Edit me",
					fontSize: 16,
					fontWeight: "normal",
					color: "#ffffff",
					createdBy: creatorId,
					votes: 0,
				};

				const tempId = `temp-id-${now}` as Id<"element">;

				setLocalElements((prev) => [
					...prev,
					{
						...newElement,
						_id: tempId,
						_creationTime: now,
						createdAt: now,
						updatedAt: now,
						commentCount: 0,
						hasVoted: false,
					},
				]);

				setSelectedTool("select");

				try {
					const id = await insertElement({
						element: newElement,
					});

					setLocalElements((prev) =>
						prev.map((el) => (el._id === tempId ? { ...el, _id: id } : el)),
					);

					setSelectedElement(id);
					setEditingElement(id);
				} catch (error) {
					if (error instanceof ConvexError) {
						toast.error(error.data);
					} else {
						console.error("Failed to insert element:", error);
						toast.error("Failed to insert element. Please try again.");
					}
					// Remove optimistic update on error
					setLocalElements((prev) => prev.filter((el) => el._id !== tempId));
				}
			} else if (selectedTool === "note") {
				const canvasPos = screenToCanvas(e.clientX, e.clientY);
				const now = Date.now();

				const newElement: Omit<
					BoardElement,
					"_id" | "_creationTime" | "createdAt" | "updatedAt"
				> = {
					projectId: params.projectId as Id<"project">,
					elementType: "note",
					x: canvasPos.x,
					y: canvasPos.y,
					width: 240,
					height: 160,
					content: "Edit me",
					fontSize: 16,
					fontWeight: "normal",
					color: "#ffffff",
					createdBy: creatorId,
					votes: 0,
				};

				const tempId = `temp-id-${now}` as Id<"element">;

				setLocalElements((prev) => [
					...prev,
					{
						...newElement,
						_id: tempId,
						_creationTime: now,
						createdAt: now,
						updatedAt: now,
						commentCount: 0,
						hasVoted: false,
					},
				]);

				setSelectedTool("select"); // Switch back to select tool after adding

				try {
					const id = await insertElement({
						element: newElement,
					});

					setLocalElements((prev) =>
						prev.map((el) => (el._id === tempId ? { ...el, _id: id } : el)),
					);

					setSelectedElement(id);
					setEditingElement(id);
				} catch (error) {
					if (error instanceof ConvexError) {
						toast.error(error.data);
					} else {
						console.error("Failed to insert element:", error);
						toast.error("Failed to insert element. Please try again.");
					}
					// Remove optimistic update on error
					setLocalElements((prev) => prev.filter((el) => el._id !== tempId));
				}
			} else {
				// If selecting tool is 'select' or 'hand' and not panning, deselect elements
				setSelectedElement(null);
			}
		} else {
			// If clicking on an existing element
			const clickedElement = (e.target as HTMLElement).closest(
				"[data-element-id]",
			) as HTMLElement | null;
			const clickedElementId = clickedElement?.dataset.elementId || "-1";

			if (clickedElementId !== "-1") {
				const element = localElements.find((el) => el._id === clickedElementId);
				if (element) {
					if (selectedTool === "select") {
						setSelectedElement(element._id);
						setDraggedElement(element._id);
						const canvasPos = screenToCanvas(e.clientX, e.clientY);
						setDragOffset({
							x: canvasPos.x - element.x,
							y: canvasPos.y - element.y,
						});
					} else if (
						(selectedTool === "arrow" || selectedTool === "line") &&
						element.elementType !== "arrow" &&
						element.elementType !== "line"
					) {
						// If drawing a connector and clicked an element, set it as the start point
						setIsDrawing(true);
						setDrawStart({ x: element.x, y: element.y }); // Or a point on the element's boundary
						setPreviewElement({
							start: { x: element.x, y: element.y },
							end: { x: element.x, y: element.y },
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
		debouncedUpdatePresence(canvasPos.x, canvasPos.y);

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

			const { id, handle, startSize, startElementPos } = resizingElement;
			const el = localElements.find((el) => el._id === id);
			if (!el) return;

			let width = startSize.width;
			let height = startSize.height;
			let x = startElementPos.x;
			let y = startElementPos.y;

			if (handle.includes("e")) width = Math.max(50, startSize.width + dx);
			if (handle.includes("w")) {
				width = Math.max(50, startSize.width - dx);
				x = startElementPos.x + (startSize.width - width);
			}
			if (handle.includes("s")) height = Math.max(50, startSize.height + dy);
			if (handle.includes("n")) {
				height = Math.max(50, startSize.height - dy);
				y = startElementPos.y + (startSize.height - height);
			}

			debouncedElementUpdate(id, { x, y, width, height });
			return;
		}

		if (draggedElement !== null) {
			const canvasPos = screenToCanvas(e.clientX, e.clientY);
			const draggedEl = localElements.find((el) => el._id === draggedElement);
			if (!draggedEl) return;

			if (draggedEl?.groupId) {
				const groupElements = elements.filter(
					(el) => el.groupId === draggedEl.groupId,
				);
				const dx = canvasPos.x - dragOffset.x - draggedEl.x;
				const dy = canvasPos.y - dragOffset.y - draggedEl.y;

				// setElements(
				// 	normalizedElements.map((el) => {
				// 		if (el.groupId !== draggedEl.groupId) return el;

				// 		const newX = el.position.x + dx;
				// 		const newY = el.position.y + dy;

				// 		// For arrows and lines, also update the endPosition
				// 		if (el.elementType === "arrow" || el.elementType === "line") {
				// 			return {
				// 				...el,
				// 				position: { x: newX, y: newY },
				// 				endPosition: {
				// 					x: el.endPosition.x + dx,
				// 					y: el.endPosition.y + dy,
				// 				},
				// 			};
				// 		}

				// 		return { ...el, position: { x: newX, y: newY } };
				// 	}),
				// );
			} else {
				const newX = canvasPos.x - dragOffset.x;
				const newY = canvasPos.y - dragOffset.y;

				setLocalElements((prev) =>
					prev.map((el) =>
						el._id === draggedElement ? { ...el, x: newX, y: newY } : el,
					),
				);

				debouncedElementUpdate(draggedEl._id, {
					x: newX,
					y: newY,
					votes: draggedEl.votes,
				});
			}
			return;
		}

		if (isDrawing && previewElement) {
			const canvasPos = screenToCanvas(e.clientX, e.clientY);
			setPreviewElement({ ...previewElement, end: canvasPos });
		}
	};

	const handleCanvasMouseUp = async (e: React.MouseEvent<HTMLDivElement>) => {
		if (isPanning) {
			setIsPanning(false);
			return;
		}

		if (draggedElement) {
			const el = localElements.find((el) => el._id === draggedElement);
			if (el && !isTempId(el._id)) {
				(async () => {
					try {
						await updateElement({
							projectId: params.projectId as Id<"project">,
							id: el._id,
							patch: { x: el.x, y: el.y },
						});
					} catch (error) {
						if (error instanceof ConvexError) {
							console.error("Failed to update element position:", error.data);
						} else {
							console.error("Failed to update element position:", error);
						}
					}
				})();
			}
			setDraggedElement(null);
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
					const now = Date.now();

					const newElement: Omit<
						BoardElement,
						"_id" | "_creationTime" | "createdAt" | "updatedAt"
					> = {
						projectId: params.projectId as Id<"project">,
						elementType: selectedTool,
						x: drawStart.x,
						y: drawStart.y,
						endX: canvasPos.x,
						endY: canvasPos.y,
						strokeColor: "#ffffff",
						strokeWidth: 2,
						createdBy: creatorId,
						votes: 0,
					};

					const tempId = `temp-id-${now}` as Id<"element">;

					setLocalElements((prev) => [
						...prev,
						{
							...newElement,
							_id: tempId,
							_creationTime: now,
							createdAt: now,
							updatedAt: now,
							commentCount: 0,
							hasVoted: false,
						},
					]);

					setSelectedTool("select");

					try {
						const id = await insertElement({
							element: newElement,
						});

						setLocalElements((prev) =>
							prev.map((el) => (el._id === tempId ? { ...el, _id: id } : el)),
						);
					} catch (error) {
						if (error instanceof ConvexError) {
							toast.error(error.data);
						} else {
							console.error("Failed to insert element:", error);
							toast.error("Failed to insert element. Please try again.");
						}
						// Remove optimistic update on error
						setLocalElements((prev) => prev.filter((el) => el._id !== tempId));
					}
				}
			}

			if (selectedTool === "rectangle" || selectedTool === "circle") {
				const width = Math.abs(canvasPos.x - drawStart.x);
				const height = Math.abs(canvasPos.y - drawStart.y);

				if (width > 10 || height > 10) {
					const now = Date.now();

					const newElement: Omit<
						BoardElement,
						"_id" | "_creationTime" | "createdAt" | "updatedAt"
					> = {
						projectId: params.projectId as Id<"project">,
						elementType: selectedTool,
						x: Math.min(drawStart.x, canvasPos.x),
						y: Math.min(drawStart.y, canvasPos.y),
						width: Math.max(width, 50),
						height: Math.max(height, 50),
						fillColor: "transparent",
						strokeColor: "#ffffff",
						strokeWidth: 2,
						createdBy: creatorId,
						votes: 0,
					};

					const tempId = `temp-id-${now}` as Id<"element">;

					setLocalElements((prev) => [
						...prev,
						{
							...newElement,
							_id: tempId,
							_creationTime: now,
							createdAt: now,
							updatedAt: now,
							commentCount: 0,
							hasVoted: false,
						},
					]);

					setSelectedTool("select");

					try {
						const id = await insertElement({
							element: newElement,
						});

						setLocalElements((prev) =>
							prev.map((el) => (el._id === tempId ? { ...el, _id: id } : el)),
						);
					} catch (error) {
						if (error instanceof ConvexError) {
							toast.error(error.data);
						} else {
							console.error("Failed to insert element:", error);
							toast.error("Failed to insert element. Please try again.");
						}
						// Remove optimistic update on error
						setLocalElements((prev) => prev.filter((el) => el._id !== tempId));
					}
				}
			}

			setIsDrawing(false);
			setPreviewElement(null);
			setSelectedTool("select");
		}

		setDraggedElement(null);
	};

	const handleElementMouseDown = (
		e: React.MouseEvent,
		elementId: Id<"element">,
	) => {
		if (selectedTool !== "select") return;
		e.stopPropagation();

		const element = localElements.find((el) => el._id === elementId);
		if (!element) return;

		const canvasPos = screenToCanvas(e.clientX, e.clientY);
		setDraggedElement(elementId);
		setDragOffset({
			x: canvasPos.x - element.x,
			y: canvasPos.y - element.y,
		});
		setSelectedElement(elementId);
	};

	const handleElementDoubleClick = (
		e: React.MouseEvent,
		elementId: Id<"element">,
	) => {
		e.stopPropagation();
		const element = localElements.find((el) => el._id === elementId);
		if (
			element &&
			(element.elementType === "arrow" || element.elementType === "line")
		) {
			return; // Don't allow editing connectors
		}
		setEditingElement(elementId);
		setSelectedElement(elementId); // Ensure it's selected when editing
	};

	const handleResizeMouseDown = (
		e: React.MouseEvent,
		elementId: Id<"element">,
		handle: ResizeHandle,
	) => {
		e.stopPropagation();
		const element = localElements.find((el) => el._id === elementId);
		if (
			!element ||
			(element.elementType !== "note" &&
				element.elementType !== "rectangle" &&
				element.elementType !== "circle")
		)
			return;

		const canvasPos = screenToCanvas(e.clientX, e.clientY);
		setResizingElement({
			id: elementId,
			handle,
			startPos: canvasPos,
			startSize: { height: element.height || 0, width: element.width || 0 },
			startElementPos: { x: element.x || 0, y: element.y || 0 },
		});
	};

	const handleContentUpdate = (
		elementId: Id<"element">,
		newContent: string,
	) => {
		// debouncedElementUpdate(elementId, { content: newContent });
		setLocalElements((prev) =>
			prev.map((el) =>
				el._id === elementId ? { ...el, content: newContent } : el,
			),
		);
	};

	const handleWheel = (e: React.WheelEvent) => {
		e.preventDefault();
		const delta = e.deltaY > 0 ? -0.1 : 0.1;
		setZoom((prev) => Math.max(0.1, Math.min(3, prev + delta)));
	};

	const handleDeleteElement = async (id: Id<"element">) => {
		try {
			await deleteElement({ id, projectId: params.projectId as Id<"project"> });
			if (selectedElement === id) setSelectedElement(null);
		} catch (error) {
			if (error instanceof ConvexError) {
				toast.error(error.data);
			} else {
				console.error("Failed to delete element:", error);
				toast.error("Failed to delete element. Please try again.");
			}
		}
	};

	const handleVote = async (noteId: Id<"element">) => {
		const element = localElements.find((el) => el._id === noteId);
		if (!element || (element.elementType !== "note" && element.elementType !== "sticky")) {
			return;
		}

		// Optimistically update local state immediately
		const newHasVoted = !element.hasVoted;
		const newVoteCount = newHasVoted ? element.votes + 1 : Math.max(0, element.votes - 1);

		setLocalElements((prev) =>
			prev.map((el) =>
				el._id === noteId
					? {
							...el,
							votes: newVoteCount,
							hasVoted: newHasVoted,
						}
					: el,
			),
		);

		try {
			await toggleVote({
				projectId: params.projectId as Id<"project">,
				id: noteId,
			});
		} catch (error) {
			if (error instanceof ConvexError) {
				toast.error(error.data);
			} else {
				console.error("Failed to toggle vote:", error);
				toast.error("Failed to toggle vote. Please try again.");
			}
			// Revert on error
			setLocalElements((prev) =>
				prev.map((el) =>
					el._id === noteId
						? {
								...el,
								votes: element.votes,
								hasVoted: element.hasVoted,
							}
						: el,
				),
			);
		}
	};

	const handleAddComment = async (noteId: Id<"element">) => {
		if (!newComment.trim()) return;

		const element = localElements.find((el) => el._id === noteId);
		if (!element) return;

		const commentText = newComment.trim();
		const previousCommentCount = element.commentCount || 0;

		// Optimistically update local state immediately
		setLocalElements((prev) =>
			prev.map((el) =>
				el._id === noteId
					? {
							...el,
							commentCount: (el.commentCount || 0) + 1,
						}
					: el,
			),
		);

		// Clear the input immediately for better UX
		setNewComment("");

		try {
			await addComment({ id: noteId, projectId: project._id, text: commentText });
		} catch (error) {
			if (error instanceof ConvexError) {
				toast.error(error.data);
			} else {
				console.error("Failed to add comment:", error);
				toast.error("Failed to add comment. Please try again.");
			}
			// Revert on error
			setLocalElements((prev) =>
				prev.map((el) =>
					el._id === noteId
						? {
								...el,
								commentCount: previousCommentCount,
							}
						: el,
				),
			);
			// Restore the comment text
			setNewComment(commentText);
		}
	};

	const selectedElementData = localElements.find(
		(el) => el._id === selectedElement,
	);
	const selectedNoteData = localElements.find(
		(el) =>
			el._id === selectedNoteForComments &&
			(el.elementType === "note" || el.elementType === "sticky"),
	);

	const { project } = Route.useLoaderData();
	const { user } = Route.useRouteContext();

	// Workspace + Presence Data
	const workspaceMembers = useQuery(api.workspace.getWorkspaceMembers);
	const activePresence =
		useQuery(api.presence.getActiveMembers, {
			projectId: params.projectId as Id<"project">,
		}) || [];

	// Current logged-in workspace member
	const currentMember = useMemo(() => {
		return (
			workspaceMembers?.members?.find((m) => m.user.id === user.id) || null
		);
	}, [workspaceMembers, user.id]);
	const creatorId = currentMember?.id ?? user.id;

	// Presence mutators
	const updatePresence = useMutation(api.presence.updatePresence);
	const removePresence = useMutation(api.presence.removePresence);

	// Stable debounced presence update
	const debouncedUpdatePresence = useMemo(() => {
		return debounce(async (cursorX: number, cursorY: number) => {
			if (!currentMember) return;

			await updatePresence({
				projectId: params.projectId as Id<"project">,
				cursorX,
				cursorY,
			});
		}, 250);
	}, [currentMember, params.projectId, updatePresence]);

	// Live Cursors excluding yourself
	const liveCursors = useMemo<LiveCursor[]>(() => {
		if (!workspaceMembers?.members || !currentMember) return [];

		return activePresence
			.filter((p) => p.memberId !== currentMember.id)
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
			.filter((c): c is LiveCursor => c !== null);
	}, [activePresence, workspaceMembers, currentMember]);

	// Visible member avatars
	const { visibleMembers, remainingCount } = useMemo(() => {
		const activeMembersList =
			workspaceMembers?.members?.filter((member) =>
				activePresence.some((p) => p.memberId === member.id),
			) || [];

		return {
			visibleMembers: activeMembersList.slice(0, 3),
			remainingCount: activeMembersList.length - 3,
		};
	}, [activePresence, workspaceMembers]);

	// Presence Heartbeat (keeps user "online")
	useEffect(() => {
		if (!currentMember) return;

		const interval = setInterval(() => {
			(async () => {
				try {
					await updatePresence({
						projectId: params.projectId as Id<"project">,
					});
				} catch (error) {
					if (error instanceof ConvexError) {
						console.error("Failed to update presence:", error.data);
					} else {
						console.error("Failed to update presence:", error);
					}
				}
			})();
		}, 15000);

		return () => clearInterval(interval);
	}, [currentMember, params.projectId, updatePresence]);

	const getMember = useCallback(
		(memberId: string) => {
			return workspaceMembers?.members?.find((m) => m.id === memberId) || null;
		},
		[workspaceMembers],
	);

	// Cleanup on unmount / page leave
	useEffect(() => {
		return () => {
			if (currentMember) {
				(async () => {
					try {
						await removePresence({ projectId: params.projectId as Id<"project"> });
					} catch (error) {
						if (error instanceof ConvexError) {
							console.error("Failed to remove presence:", error.data);
						} else {
							console.error("Failed to remove presence:", error);
						}
					}
				})();
			}
		};
	}, [currentMember, params.projectId, removePresence]);

	return (
		<div className="h-screen flex flex-col bg-background">
			{/* Top Bar - Hidden in focus mode */}
			{!isFocusMode && (
				<DecisionBoardTopbar
					project={project}
					projectId={params.projectId}
					remainingCount={remainingCount}
					setIsFocusMode={setIsFocusMode}
					setMembersDialogOpen={setMembersDialogOpen}
					setSelectedTool={setSelectedTool}
					setShareDialogOpen={setShareDialogOpen}
					setShowAISummary={setShowAISummary}
					showAISummary={showAISummary}
					visibleMembers={visibleMembers}
				/>
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
						{localElements.map((element) => {
							const elementKey = element._id;
							const commonProps = {
								"data-element-id": element._id,
							};

							if (
								element.elementType === "note" ||
								element.elementType === "sticky"
							) {
								const colors = getColorClasses(element.color || "");
								const stickyColors = getStickyNoteColors(element.color);
								const isSelected = selectedElement === element._id;
								const isEditing = editingElement === element._id;

								const memberName =
									getMember(element.createdBy)?.user?.name || "Member";

								return (
									<div
										key={elementKey}
										{...commonProps}
										className={`absolute p-4 rounded shadow-md hover:shadow-xl transition-all group ${
											isSelected ? "ring-2 ring-primary ring-offset-2" : ""
										}`}
										style={{
											left: element.x,
											top: element.y,
											width: element.width,
											height: element.height,
											cursor: selectedTool === "select" ? "move" : "default",
											backgroundColor: stickyColors.backgroundColor,
											color: stickyColors.color,
											boxShadow:
												"0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)",
											transform: "rotate(-0.5deg)",
											fontFamily:
												"'Comic Sans MS', 'Marker Felt', cursive, sans-serif",
										}}
										onMouseDown={(e) => handleElementMouseDown(e, element._id)}
										onDoubleClick={(e) =>
											handleElementDoubleClick(e, element._id)
										}
									>
										<div className="flex items-start justify-between mb-2">
											<div className="flex items-center gap-2">
												<Avatar className="w-6 h-6">
													<AvatarFallback className="text-xs">
														{memberName[0]}
													</AvatarFallback>
												</Avatar>
												<span className="text-xs opacity-70">{memberName}</span>
											</div>
											<Button
												variant="ghost"
												size="icon"
												className="h-6 w-6 opacity-0 group-hover:opacity-100"
												onClick={(e) => {
													e.stopPropagation();
													handleDeleteElement(element._id);
												}}
											>
												<Trash2 className="w-3 h-3" />
											</Button>
										</div>

										{isEditing ? (
											<textarea
												className="w-full text-sm leading-relaxed mb-3 bg-transparent border-none outline-none resize-none overflow-auto"
												style={{
													height: (element.height || 0) - 100,
													color: "inherit",
													fontFamily: "inherit",
												}}
												value={element.content}
												onChange={(e) =>
													handleContentUpdate(element._id, e.target.value)
												}
												onBlur={() => {
													const el = localElements.find(
														(e) => e._id === element._id,
													);
													if (el && !isTempId(el._id)) {
														(async () => {
															try {
																await updateElement({
																	projectId: params.projectId as Id<"project">,
																	id: el._id,
																	patch: { content: el.content },
																});
															} catch (error) {
																if (error instanceof ConvexError) {
																	console.error("Failed to update element content:", error.data);
																} else {
																	console.error("Failed to update element content:", error);
																}
															}
														})();
													}
													setEditingElement(null);
												}}
												// autoFocus
												onClick={(e) => e.stopPropagation()}
											/>
										) : (
											<p
												className="text-sm leading-relaxed mb-3 overflow-auto whitespace-pre-wrap"
												style={{ maxHeight: (element.height || 0) - 100 }}
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
														handleVote(element._id);
													}}
													className="flex items-center gap-1 hover:opacity-80 transition-opacity"
													style={{
														color: element.hasVoted ? "#78350f" : "inherit",
													}}
												>
													<ThumbsUp
														className="w-3 h-3"
														style={{
															fill: element.hasVoted ? "#78350f" : "none",
														}}
													/>
													<span>{element.votes}</span>
												</button>
												<button
													type="button"
													onClick={(e) => {
														e.stopPropagation();
														setSelectedNoteForComments(element._id);
														setCommentsDialogOpen(true);
													}}
													className="flex items-center gap-1 hover:text-primary transition-colors"
												>
													<MessageSquare className="w-3 h-3" />
													<span>{element.commentCount}</span>
												</button>
											</div>
											<span className="opacity-60">
												{formatDateSince(element.updatedAt)}
											</span>
										</div>

										<ResizeHandles
											element={element}
											handleResizeMouseDown={handleResizeMouseDown}
											selectedElement={selectedElement}
										/>
									</div>
								);
							}

							if (element.elementType === "text") {
								const isSelected = selectedElement === element._id;
								const isEditing = isEditingElement(element._id);

								return (
									<div
										key={elementKey}
										{...commonProps}
										className={`absolute px-2 py-1 ${
											isSelected
												? "ring-2 ring-primary ring-offset-2 rounded"
												: ""
										}`}
										style={{
											left: element.x,
											top: element.y,
											fontSize: element.fontSize ?? 16,
											fontWeight: element.fontWeight ?? "normal",
											color: element.color ?? "#ffffff",
											cursor: selectedTool === "select" ? "move" : "default",
											whiteSpace: "pre-wrap",
											wordBreak: "break-word",
											minWidth: 100,
											maxWidth: 600,
										}}
										onMouseDown={(e) => handleElementMouseDown(e, element._id)}
										onDoubleClick={(e) => {
											e.stopPropagation();
											setEditingElement(element._id);
											setSelectedElement(element._id);
										}}
									>
										{isEditing ? (
											<textarea
												className="bg-transparent border border-border rounded px-2 py-1 outline-none resize-none overflow-hidden"
												style={{
													fontSize: element.fontSize ?? 16,
													fontWeight: element.fontWeight ?? "normal",
													color: element.color ?? "#ffffff",
												}}
												value={element.content ?? ""}
												onChange={(e) => {
													handleContentUpdate(element._id, e.target.value);
													e.target.style.height = "auto";
													e.target.style.height = `${e.target.scrollHeight}px`;
												}}
												onBlur={() => {
													const el = localElements.find(
														(x) => x._id === element._id,
													);
													if (el && !isTempId(el._id)) {
														(async () => {
															try {
																await updateElement({
																	projectId: params.projectId as Id<"project">,
																	id: el._id,
																	patch: { content: el.content },
																});
															} catch (error) {
																if (error instanceof ConvexError) {
																	console.error("Failed to update element content:", error.data);
																} else {
																	console.error("Failed to update element content:", error);
																}
															}
														})();
													}
													setEditingElement(null);
												}}
											/>
										) : (
											<div>{element.content}</div>
										)}
									</div>
								);
							}

							if (element.elementType === "rectangle") {
								const isSelected = selectedElement === element._id;
								return (
									<div
										key={elementKey}
										{...commonProps}
										className={`absolute ${isSelected ? "ring-2 ring-primary ring-offset-2" : ""}`}
										style={{
											left: element.x,
											top: element.y,
											width: element.width,
											height: element.height,
											backgroundColor: element.fillColor,
											border: `${element.strokeWidth}px solid ${element.strokeColor}`,
											borderRadius: "8px",
											cursor: selectedTool === "select" ? "move" : "default",
										}}
										onMouseDown={(e) => handleElementMouseDown(e, element._id)}
									>
										<ResizeHandles
											element={element}
											handleResizeMouseDown={handleResizeMouseDown}
											selectedElement={selectedElement}
										/>
									</div>
								);
							}

							if (element.elementType === "circle") {
								const isSelected = selectedElement === element._id;
								return (
									<div
										key={elementKey}
										{...commonProps}
										className={`absolute ${isSelected ? "ring-2 ring-primary ring-offset-2" : ""}`}
										style={{
											left: element.x,
											top: element.y,
											width: element.width,
											height: element.height,
											backgroundColor: element.fillColor,
											border: `${element.strokeWidth}px solid ${element.strokeColor}`,
											borderRadius: "50%",
											cursor: selectedTool === "select" ? "move" : "default",
										}}
										onMouseDown={(e) => handleElementMouseDown(e, element._id)}
									>
										<ResizeHandles
											element={element}
											handleResizeMouseDown={handleResizeMouseDown}
											selectedElement={selectedElement}
										/>
									</div>
								);
							}

							if (
								element.elementType === "arrow" ||
								element.elementType === "line"
							) {
								if (element.endX && element.endY) {
									const isSelected = selectedElement === element._id;
									const dx = element.endX - element.x;
									const dy = element.endY - element.y;
									const length = Math.sqrt(dx * dx + dy * dy);
									const angle = Math.atan2(dy, dx) * (180 / Math.PI);

									return (
										<div
											key={elementKey}
											{...commonProps}
											className={`absolute ${isSelected ? "ring-2 ring-primary ring-offset-2" : ""}`}
											style={{
												left: element.x,
												top: element.y,
												width: length,
												height: element.strokeWidth,
												backgroundColor: element.strokeColor,
												transform: `rotate(${angle}deg)`,
												transformOrigin: "0 50%",
												cursor: selectedTool === "select" ? "move" : "default",
											}}
											onMouseDown={(e) =>
												handleElementMouseDown(e, element._id)
											}
										>
											{element.elementType === "arrow" && (
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
						<DecisionBoardZoomControls zoom={zoom} setZoom={setZoom} />
					)}

					{/* Toolbar - Hidden in focus mode */}
					{!isFocusMode && (
						<DecisionBoardToolbar
							selectedTool={selectedTool}
							setSelectedTool={setSelectedTool}
						/>
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
					<AISummarySidebar
						elements={elements}
						liveCursors={liveCursors}
						setSelectedElement={setSelectedElement}
						setShowAISummary={setShowAISummary}
					/>
				)}
			</div>

			<DecisionBoardMembersDialog
				membersDialogOpen={membersDialogOpen}
				setMembersDialogOpen={setMembersDialogOpen}
				activeMembers={activePresence}
				workspaceMembers={workspaceMembers?.members || []}
			/>

			<DecisionBoardSharedialog
				projectId={params.projectId}
				setShareDialogOpen={setShareDialogOpen}
				shareDialogOpen={shareDialogOpen}
			/>

			{/* Comments Dialog */}
			{selectedNoteData && (
				<DecisionBoardComments
					newComment={newComment}
					setNewComment={setNewComment}
					commentsDialogOpen={commentsDialogOpen}
					setCommentsDialogOpen={setCommentsDialogOpen}
					handleAddComment={handleAddComment}
					selectedNoteData={selectedNoteData}
					selectedNoteForComments={selectedNoteForComments}
					noteId={selectedNoteData?._id}
					projectId={project._id}
				/>
			)}
		</div>
	);
}
