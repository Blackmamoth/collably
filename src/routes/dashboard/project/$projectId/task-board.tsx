import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import type React from "react";

import { useState } from "react";
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
import {
	ArrowLeft,
	Plus,
	Filter,
	MoreVertical,
	Calendar,
	Flag,
	Users,
	Share2,
} from "lucide-react";

type Task = {
	id: number;
	title: string;
	description: string;
	assignee: { name: string; avatar: string };
	dueDate: string;
	priority: "low" | "medium" | "high";
	tags: string[];
	column: "todo" | "inprogress" | "done";
};

export const Route = createFileRoute(
	"/dashboard/project/$projectId/task-board",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const [tasks, setTasks] = useState<Task[]>([
		{
			id: 1,
			title: "Design new landing page",
			description:
				"Create mockups for the new landing page with updated branding",
			assignee: {
				name: "Alice",
				avatar: "/placeholder.svg?height=32&width=32",
			},
			dueDate: "Mar 15",
			priority: "high",
			tags: ["design", "frontend"],
			column: "todo",
		},
		{
			id: 2,
			title: "Update documentation",
			description: "Add API documentation for new endpoints",
			assignee: { name: "Bob", avatar: "/placeholder.svg?height=32&width=32" },
			dueDate: "Mar 18",
			priority: "medium",
			tags: ["docs"],
			column: "todo",
		},
		{
			id: 3,
			title: "Implement authentication",
			description: "Add OAuth support for Google and GitHub",
			assignee: {
				name: "Charlie",
				avatar: "/placeholder.svg?height=32&width=32",
			},
			dueDate: "Mar 12",
			priority: "high",
			tags: ["backend", "security"],
			column: "inprogress",
		},
		{
			id: 4,
			title: "Fix mobile responsiveness",
			description: "Improve layout on mobile devices",
			assignee: {
				name: "David",
				avatar: "/placeholder.svg?height=32&width=32",
			},
			dueDate: "Mar 10",
			priority: "medium",
			tags: ["frontend", "bug"],
			column: "inprogress",
		},
		{
			id: 5,
			title: "Setup project repository",
			description: "Initialize Git repo and CI/CD pipeline",
			assignee: { name: "Eve", avatar: "/placeholder.svg?height=32&width=32" },
			dueDate: "Mar 5",
			priority: "low",
			tags: ["devops"],
			column: "done",
		},
	]);

	const [isAddingTask, setIsAddingTask] = useState(false);
	const [newTask, setNewTask] = useState({
		title: "",
		description: "",
		priority: "medium" as "low" | "medium" | "high",
		dueDate: "",
		assignee: "",
	});

	const [draggedTask, setDraggedTask] = useState<number | null>(null);

	const columns = [
		{
			id: "todo",
			title: "To Do",
			count: tasks.filter((t) => t.column === "todo").length,
		},
		{
			id: "inprogress",
			title: "In Progress",
			count: tasks.filter((t) => t.column === "inprogress").length,
		},
		{
			id: "done",
			title: "Done",
			count: tasks.filter((t) => t.column === "done").length,
		},
	];

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

	const handleAddTask = () => {
		if (newTask.title.trim()) {
			const selectedMember =
				teamMembers.find((m) => m.name === newTask.assignee) || teamMembers[0];
			const task: Task = {
				id: Date.now(),
				title: newTask.title,
				description: newTask.description,
				assignee: { name: selectedMember.name, avatar: selectedMember.avatar },
				dueDate: newTask.dueDate || "No date",
				priority: newTask.priority,
				tags: [],
				column: "todo",
			};
			setTasks([...tasks, task]);
			setNewTask({
				title: "",
				description: "",
				priority: "medium",
				dueDate: "",
				assignee: "",
			});
			setIsAddingTask(false);
		}
	};

	const handleDragStart = (taskId: number) => {
		setDraggedTask(taskId);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
	};

	const handleDrop = (columnId: "todo" | "inprogress" | "done") => {
		if (draggedTask !== null) {
			setTasks(
				tasks.map((task) =>
					task.id === draggedTask ? { ...task, column: columnId } : task,
				),
			);
			setDraggedTask(null);
		}
	};

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

	const params = useParams({
		from: "/dashboard/project/$projectId/task-board",
	});

	return (
		<div className="h-screen flex flex-col bg-background">
			{/* Top Bar */}
			<header className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0">
				<div className="flex items-center gap-4">
					<Link to={`/dashboard/project/${params.projectId}`}>
						<Button variant="ghost" size="icon">
							<ArrowLeft className="w-5 h-5" />
						</Button>
					</Link>
					<div>
						<h1 className="font-semibold">Sprint Planning</h1>
						<p className="text-xs text-muted-foreground">Task Board</p>
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
							<div className="space-y-4 pt-4">
								<div className="space-y-2">
									<Label htmlFor="title">Title</Label>
									<Input
										id={"title"}
										placeholder="Task title"
										value={newTask.title}
										onChange={(e) =>
											setNewTask({ ...newTask, title: e.target.value })
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="description">Description</Label>
									<Textarea
										id={"description"}
										placeholder="Task description"
										value={newTask.description}
										onChange={(e) =>
											setNewTask({ ...newTask, description: e.target.value })
										}
										className="min-h-[100px]"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="assignee">Assign to</Label>
									<Select
										value={newTask.assignee}
										onValueChange={(value) =>
											setNewTask({ ...newTask, assignee: value })
										}
									>
										<SelectTrigger id={"assignee"}>
											<SelectValue placeholder="Select team member" />
										</SelectTrigger>
										<SelectContent>
											{teamMembers.map((member) => (
												<SelectItem key={member.name} value={member.name}>
													<div className="flex items-center gap-2">
														<Avatar className="w-5 h-5">
															<AvatarImage
																src={member.avatar || "/placeholder.svg"}
															/>
															<AvatarFallback className="text-xs">
																{member.name[0]}
															</AvatarFallback>
														</Avatar>
														{member.name}
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="priority">Priority</Label>
										<Select
											value={newTask.priority}
											onValueChange={(value: "low" | "medium" | "high") =>
												setNewTask({ ...newTask, priority: value })
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
									<div className="space-y-2">
										<Label htmlFor="dueDate">Due Date</Label>
										<Input
											id={"dueDate"}
											type="date"
											value={newTask.dueDate}
											onChange={(e) =>
												setNewTask({ ...newTask, dueDate: e.target.value })
											}
										/>
									</div>
								</div>
								<div className="flex justify-end gap-2 pt-4">
									<Button
										variant="outline"
										onClick={() => setIsAddingTask(false)}
									>
										Cancel
									</Button>
									<Button onClick={handleAddTask}>Create Task</Button>
								</div>
							</div>
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
					{columns.map((column) => (
						<div
							key={column.id}
							className="w-80 flex flex-col shrink-0"
							onDragOver={handleDragOver}
							onDrop={() =>
								handleDrop(column.id as "todo" | "inprogress" | "done")
							}
						>
							{/* Column Header */}
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center gap-2">
									<h2 className="font-semibold text-sm">{column.title}</h2>
									<Badge variant="secondary" className="text-xs">
										{column.count}
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
								{tasks
									.filter((task) => task.column === column.id)
									.map((task) => (
										<div
											key={task.id}
											draggable
											onDragStart={() => handleDragStart(task.id)}
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
													{task.tags.map((tag, idx) => (
														<Badge
															key={idx}
															variant="secondary"
															className="text-xs px-2 py-0"
														>
															{tag}
														</Badge>
													))}
												</div>
											)}

											{/* Footer */}
											<div className="flex items-center justify-between pt-2 border-t border-border">
												<div className="flex items-center gap-2">
													<Avatar className="w-6 h-6">
														<AvatarImage
															src={task.assignee.avatar || "/placeholder.svg"}
														/>
														<AvatarFallback className="text-xs">
															{task.assignee.name[0]}
														</AvatarFallback>
													</Avatar>
													<div className="flex items-center gap-1 text-xs text-muted-foreground">
														<Calendar className="w-3 h-3" />
														<span>{task.dueDate}</span>
													</div>
												</div>
												<Badge
													variant="outline"
													className={`text-xs ${getPriorityColor(task.priority)}`}
												>
													<Flag className="w-3 h-3 mr-1" />
													{task.priority}
												</Badge>
											</div>
										</div>
									))}

								{/* Empty State */}
								{tasks.filter((task) => task.column === column.id).length ===
									0 && (
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
