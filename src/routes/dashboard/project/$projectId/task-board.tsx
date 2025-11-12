import {
	createFileRoute,
	Link,
	redirect,
	useParams,
} from "@tanstack/react-router";
import type React from "react";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
	ArrowLeft,
	Plus,
	Filter,
	MoreVertical,
	Calendar,
	Flag,
	Users,
	Share2,
	Sparkles,
	CheckCircle2,
	X,
	CheckCircle,
} from "lucide-react";
import type { Id } from "convex/_generated/dataModel";
import { api } from "convex/_generated/api";
import { useAction, useMutation, useQuery } from "convex/react";
import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import { formatDateUntil } from "@/lib/common/helper";
import type { TaskWithSubtasks } from "@/lib/common/types";
import { ConvexError } from "convex/values";

const schema = z.object({
	title: z.string().min(1, "title is required"),
	description: z.string().or(z.literal("")),
	assignee: z.string().min(1, "assignee is required"),
	priority: z.enum(["low", "medium", "high"]),
	dueDate: z.string().or(z.literal("")),
});

export const Route = createFileRoute(
	"/dashboard/project/$projectId/task-board",
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
	const [isAddingTask, setIsAddingTask] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const [draggedTask, setDraggedTask] = useState<Id<"task"> | null>(null);
	const [generatingSubTaskId, setGeneratingSubTaskId] =
		useState<Id<"task"> | null>(null);

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case "high":
				return "bg-red-500/10 text-red-500 border-red-500/20";
			case "medium":
				return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
			case "low":
				return "bg-green-500/10 text-green-500 border-green-500/20";
			default:
				return "bg-muted text-muted-foreground";
		}
	};

	const handleDragStart = (taskId: Id<"task">) => {
		setDraggedTask(taskId);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
	};

	const params = useParams({ from: Route.id });

	const { project } = Route.useLoaderData();
	const { user } = Route.useRouteContext();

	const updatePresence = useMutation(api.presence.updatePresence);
	const removePresence = useMutation(api.presence.removePresence);

	const workspaceMembers = useQuery(api.workspace.getWorkspaceMembers);
	const activeMembers =
		useQuery(api.presence.getActiveMembers, {
			projectId: project._id,
		}) || [];

	const getMember = (memberId: string) =>
		workspaceMembers?.members?.find((m) => m.id === memberId);

	const isMemberActive = (memberId: string): boolean => {
		return activeMembers.find((m) => m.memberId === memberId) !== undefined;
	};

	const createTask = useAction(api.task.createTask);
	const updateTaskStatus = useMutation(api.task.updateTaskStatus);
	const removeTask = useMutation(api.task.removeTask);

	const groupedTasks =
		useQuery(api.task.getTasks, { projectId: project._id }) || [];

	const generateSubTasks = useAction(api.task.generateSubTasks);

	const generateSubtasksFor = async (taskId: Id<"task">) => {
		setGeneratingSubTaskId(taskId);
		setIsLoading(true);

		await generateSubTasks({ taskId });

		setGeneratingSubTaskId(null);
		setIsLoading(false);
	};

	const toggleSubtask = async (task: TaskWithSubtasks) => {
		await updateTaskStatus({
			taskId: task._id,
			projectId: project._id,
			newStatus: task.status === "done" ? "todo" : "done",
		});
	};

	const handleDrop = async (newStatus: "todo" | "inprogress" | "done") => {
		if (draggedTask !== null) {
			try {
				await updateTaskStatus({
					projectId: project._id,
					taskId: draggedTask,
					newStatus,
				});
			} catch (error) {
				if (error instanceof ConvexError) {
					toast.error(error.data);
				}
			} finally {
				setDraggedTask(null);
			}
		}
	};

	const removeSubtask = async (taskId: Id<"task">) => {
		await removeTask({ taskId, projectId: project._id });
	};

	const form = useForm({
		defaultValues: {
			title: "",
			description: "",
			assignee: "",
			priority: "low" as "low" | "medium" | "high",
			dueDate: "",
		},
		validators: {
			onChange: schema,
		},
		onSubmit: async ({ value }) => {
			setIsLoading(true);
			if (workspaceMembers?.members) {
				const currentMember = workspaceMembers?.members?.find(
					(m) => m.user.id === user.id,
				);

				if (!currentMember) {
					setIsAddingTask(false);
					return;
				}

				const data = {
					...value,
					projectId: project._id,
					dueDate: value.dueDate === "" ? 0 : new Date(value.dueDate).getTime(),
					createdBy: currentMember.id,
					priority: value.priority,
				};

				await createTask(data);
			}
			setIsAddingTask(false);
			setIsLoading(false);
			form.reset();
		},
	});

	useEffect(() => {
		updatePresence({
			projectId: project._id,
		});

		return () => {
			removePresence({ projectId: project._id });
		};
	}, [project._id, updatePresence, removePresence]);

	return (
		<div className="h-screen flex flex-col bg-background">
			{/* Top Bar */}
			<header className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0">
				<div className="flex items-center gap-4">
					<Link to={`/dashboard/project/$projectId`} params={params}>
						<Button variant="ghost" size="icon">
							<ArrowLeft className="w-5 h-5" />
						</Button>
					</Link>
					<div>
						<h1 className="font-semibold">{project.name}</h1>
						<p className="text-xs text-muted-foreground">Task Board</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					{/* Team Avatars */}
					{workspaceMembers?.members && (
						<div className="flex items-center -space-x-2 mr-2">
							{workspaceMembers.members.map((member) => (
								<div key={member.id} className="relative">
									<Avatar className="w-8 h-8 border-2 border-background">
										<AvatarImage
											src={member.user.image || "/placeholder.svg"}
										/>
										<AvatarFallback>{member.user.name[0]}</AvatarFallback>
									</Avatar>
									{isMemberActive(member.id) ? (
										<span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
									) : (
										<span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-gray-500 rounded-full border-2 border-background" />
									)}
								</div>
							))}
						</div>
					)}

					<Button variant="outline" size="sm">
						<Filter className="w-4 h-4 mr-2" />
						Filter
					</Button>

					<Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
						<DialogTrigger asChild>
							<Button size="sm">
								<Plus className="w-4 h-4 mr-2" />
								Add Task
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Create new task</DialogTitle>
								<DialogDescription>
									Add a new task to your board
								</DialogDescription>
							</DialogHeader>
							<form
								onSubmit={(e) => {
									e.preventDefault();
									e.stopPropagation();
									form.handleSubmit();
								}}
							>
								<div className="space-y-4 pt-4">
									<form.Field name="title">
										{(field) => (
											<div className="space-y-2">
												<Label htmlFor="title">Title</Label>
												<Input
													id={"title"}
													placeholder="Task title"
													value={field.state.value}
													onChange={(e) => field.handleChange(e.target.value)}
												/>
											</div>
										)}
									</form.Field>

									<form.Field name="description">
										{(field) => (
											<div className="space-y-2">
												<Label htmlFor="description">Description</Label>
												<Textarea
													id={"description"}
													placeholder="Task description"
													value={field.state.value}
													onChange={(e) => field.handleChange(e.target.value)}
													className="min-h-[100px]"
												/>
											</div>
										)}
									</form.Field>

									<form.Field name="assignee">
										{(field) => (
											<div className="space-y-2">
												<Label htmlFor="assignee">Assign to</Label>
												<Select
													value={field.state.value}
													onValueChange={field.handleChange}
												>
													<SelectTrigger id={"assignee"}>
														<SelectValue placeholder="Select team member" />
													</SelectTrigger>
													<SelectContent>
														{workspaceMembers?.members?.map((member) => (
															<SelectItem key={member.id} value={member.id}>
																<div className="flex items-center gap-2">
																	<Avatar className="w-5 h-5">
																		<AvatarImage
																			src={
																				member.user.image || "/placeholder.svg"
																			}
																		/>
																		<AvatarFallback className="text-xs">
																			{member.user.name[0]}
																		</AvatarFallback>
																	</Avatar>
																	{member.user.name}
																</div>
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>
										)}
									</form.Field>

									<div className="grid grid-cols-2 gap-4">
										<form.Field name="priority">
											{(field) => (
												<div className="space-y-2">
													<Label htmlFor="priority">Priority</Label>
													<Select
														value={field.state.value}
														onValueChange={(v) =>
															field.handleChange(v as "low" | "medium" | "high")
														}
													>
														<SelectTrigger id={"priority"}>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="low">Low</SelectItem>
															<SelectItem value="medium">Medium</SelectItem>
															<SelectItem value="high">High</SelectItem>
														</SelectContent>
													</Select>
												</div>
											)}
										</form.Field>

										<form.Field name="dueDate">
											{(field) => (
												<div className="space-y-2">
													<Label htmlFor="dueDate">Due Date</Label>
													<Input
														id={"dueDate"}
														type="date"
														value={field.state.value}
														onChange={(e) => field.handleChange(e.target.value)}
													/>
												</div>
											)}
										</form.Field>
									</div>
									<div className="flex justify-end gap-2 pt-4">
										<Button
											variant="outline"
											onClick={() => setIsAddingTask(false)}
										>
											Cancel
										</Button>
										<Button disabled={isLoading} type="submit">
											Create Task
										</Button>
									</div>
								</div>
							</form>
						</DialogContent>
					</Dialog>

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
								<Users className="w-4 h-4 mr-2" />
								Manage members
							</DropdownMenuItem>
							<DropdownMenuItem>Export board</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem className="text-destructive">
								Delete board
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</header>

			{/* Kanban Board */}
			<div className="flex-1 overflow-x-auto overflow-y-hidden">
				<div className="h-full flex gap-4 p-6 min-w-max">
					{groupedTasks.map((groupDetails) => (
						<div
							key={groupDetails.status}
							className="w-80 flex flex-col shrink-0"
							onDragOver={handleDragOver}
							onDrop={() => handleDrop(groupDetails.status)}
						>
							{/* Column Header */}
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center gap-2">
									<h2 className="font-semibold text-sm">
										{groupDetails.title}
									</h2>
									<Badge variant="secondary" className="text-xs">
										{groupDetails.tasks.length}
									</Badge>
								</div>
								<Button
									variant="ghost"
									size="icon"
									className="h-6 w-6"
									onClick={() => setIsAddingTask(true)}
								>
									<Plus className="w-4 h-4" />
								</Button>
							</div>

							{/* Tasks */}
							<div className="flex-1 space-y-3 overflow-y-auto">
								{groupDetails.tasks.map((task) => (
									<div
										key={task._id}
										draggable
										onDragStart={() => handleDragStart(task._id)}
										className="bg-card border border-border rounded-lg p-4 hover:border-muted-foreground/20 transition-colors cursor-move group"
									>
										<div className="flex items-start justify-between mb-2">
											<h3 className="font-medium text-sm leading-snug pr-2">
												{task.title}
											</h3>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
													>
														<MoreVertical className="w-3 h-3" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem>Edit task</DropdownMenuItem>
													<DropdownMenuItem>Change assignee</DropdownMenuItem>
													<DropdownMenuItem>Move to...</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem className="text-destructive">
														Delete
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</div>

										{task.description && (
											<p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
												{task.description}
											</p>
										)}

										{/* Tags */}
										{task.tags.length > 0 && (
											<div className="flex flex-wrap gap-1 mb-3">
												{task.tags.map((tag) => (
													<Badge
														key={tag}
														variant="secondary"
														className="text-xs px-2 py-0"
													>
														{tag}
													</Badge>
												))}
											</div>
										)}

										{/* AI subtask generation button for todo and inprogress tasks */}
										{(task.status === "todo" || task.status === "inprogress") &&
											task.subTasks.length === 0 && (
												<Button
													variant="outline"
													size="sm"
													className="w-full mb-3 text-xs bg-transparent"
													onClick={() => generateSubtasksFor(task._id)}
													disabled={
														isLoading && generatingSubTaskId === task._id
													}
												>
													<Sparkles className="w-3 h-3 mr-1.5" />
													{isLoading && generatingSubTaskId === task._id
														? "Generating..."
														: "Generate Subtasks with AI"}
												</Button>
											)}

										{/* Subtasks display */}
										{task.subTasks && task.subTasks.length > 0 && (
											<div className="mb-3 space-y-1.5">
												<div className="flex items-center justify-between mb-1.5">
													<span className="text-xs font-medium text-muted-foreground">
														Subtasks (
														{
															task.subTasks.filter((st) => st.status === "done")
																.length
														}
														/{task.subTasks.length})
													</span>
												</div>
												<div className="space-y-1">
													{task.subTasks.map((subtask) => (
														<div
															key={subtask._id}
															className="flex items-start gap-2 text-xs p-1.5 rounded hover:bg-muted/50 transition-colors group/subtask"
														>
															<button
																type="button"
																onClick={() => toggleSubtask(subtask)}
																className="shrink-0 mt-0.5"
															>
																<CheckCircle2
																	className={`w-3.5 h-3.5 ${
																		subtask.status === "done"
																			? "text-primary fill-primary"
																			: "text-muted-foreground"
																	}`}
																/>
															</button>
															<span
																className={`leading-relaxed flex-1 ${
																	subtask.status === "done"
																		? "line-through text-muted-foreground"
																		: ""
																}`}
															>
																{subtask.title}
															</span>
															<button
																type="button"
																onClick={() => removeSubtask(subtask._id)}
																className="opacity-0 group-hover/subtask:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
																title="Remove subtask"
															>
																<X size={15} />
															</button>
														</div>
													))}
												</div>
											</div>
										)}

										{/* Footer */}
										<div className="flex items-center justify-between pt-2 border-t border-border">
											<div className="flex items-center gap-2">
												<Avatar className="w-6 h-6">
													<AvatarImage
														src={
															getMember(task.assignee)?.user?.image ||
															"/placeholder.svg"
														}
													/>
													<AvatarFallback className="text-xs">
														{
															(getMember(task.assignee)?.user?.name ||
																"Member")[0]
														}
													</AvatarFallback>
												</Avatar>
												{task.dueDate && task.status !== "done" && (
													<div className="flex items-center gap-1 text-xs text-muted-foreground">
														<Calendar className="w-3 h-3" />
														<span>{formatDateUntil(task.dueDate, "Due")}</span>
													</div>
												)}
											</div>
											<Badge
												variant="outline"
												className={`text-xs ${
													task.status === "done"
														? "bg-green-500/10 text-green-600 border-green-500/20"
														: getPriorityColor(task.priority)
												}`}
											>
												{task.status === "done" ? (
													<>
														<CheckCircle className="w-3 h-3 mr-1" />
														Done
													</>
												) : (
													<>
														<Flag className="w-3 h-3 mr-1" />
														{task.priority}
													</>
												)}
											</Badge>
										</div>
									</div>
								))}

								{/* Empty State */}
								{groupDetails.tasks.length === 0 && (
									<div className="flex flex-col items-center justify-center py-12 text-center">
										<div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
											<Plus className="w-6 h-6 text-muted-foreground" />
										</div>
										<p className="text-sm text-muted-foreground mb-2">
											No tasks yet
										</p>
										<Button
											variant="ghost"
											size="sm"
											className="text-xs"
											onClick={() => setIsAddingTask(true)}
										>
											Add a task
										</Button>
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
