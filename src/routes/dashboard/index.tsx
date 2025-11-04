import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Layers,
	Search,
	Bell,
	ChevronDown,
	Plus,
	Settings,
	Users,
	Kanban,
	Clock,
	MoreHorizontal,
	PanelLeftClose,
	PanelLeft,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { NoProjectsEmpty } from "@/components/empty-states";

export const Route = createFileRoute("/dashboard/")({
	component: RouteComponent,
});

function RouteComponent() {
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
	const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
	const [workspaceName, setWorkspaceName] = useState("");
	const [workspaceDescription, setWorkspaceDescription] = useState("");

	// Mock data
	const recentProjects = [
		{
			id: 1,
			name: "Product Roadmap Q1",
			type: "project",
			lastUpdated: "2 hours ago",
			members: [
				{ name: "Alice", avatar: "/placeholder.svg?height=32&width=32" },
				{ name: "Bob", avatar: "/placeholder.svg?height=32&width=32" },
				{ name: "Charlie", avatar: "/placeholder.svg?height=32&width=32" },
			],
		},
		{
			id: 2,
			name: "Sprint Planning",
			type: "project",
			lastUpdated: "5 hours ago",
			members: [
				{ name: "David", avatar: "/placeholder.svg?height=32&width=32" },
				{ name: "Eve", avatar: "/placeholder.svg?height=32&width=32" },
			],
		},
		{
			id: 3,
			name: "Design System Updates",
			type: "project",
			lastUpdated: "1 day ago",
			members: [
				{ name: "Frank", avatar: "/placeholder.svg?height=32&width=32" },
				{ name: "Grace", avatar: "/placeholder.svg?height=32&width=32" },
				{ name: "Henry", avatar: "/placeholder.svg?height=32&width=32" },
				{ name: "Ivy", avatar: "/placeholder.svg?height=32&width=32" },
			],
		},
	];

	const activities = [
		{
			id: 1,
			user: "Alice",
			action: "created a new task",
			target: "Implement authentication",
			project: "Sprint Planning",
			time: "10 minutes ago",
		},
		{
			id: 2,
			user: "Bob",
			action: "added a note to",
			target: "Product Roadmap Q1",
			project: "Product Roadmap Q1",
			time: "1 hour ago",
		},
		{
			id: 3,
			user: "Charlie",
			action: "completed",
			target: "Design review",
			project: "Design System Updates",
			time: "3 hours ago",
		},
	];

	const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
	const [projectName, setProjectName] = useState("");

	const handleCreateWorkspace = () => {
		console.log("[v0] Creating workspace:", {
			workspaceName,
			workspaceDescription,
		});
		setIsCreateWorkspaceOpen(false);
		setWorkspaceName("");
		setWorkspaceDescription("");
	};

	const handleCreateProject = () => {
		console.log("[v0] Creating project:", { projectName });
		setIsCreateProjectOpen(false);
		setProjectName("");
	};

	return (
		<div className="min-h-screen bg-background flex">
			<aside
				className={`border-r border-border flex flex-col transition-all duration-300 ${isSidebarCollapsed ? "w-16" : "w-64"}`}
			>
				<div className="p-4 border-b border-border flex items-center gap-2">
					{!isSidebarCollapsed ? (
						<>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										className="flex-1 justify-between h-10 px-3"
									>
										<div className="flex items-center gap-2">
											<div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
												<Layers className="w-4 h-4 text-primary-foreground" />
											</div>
											<span className="font-semibold text-sm">
												My Workspace
											</span>
										</div>
										<ChevronDown className="w-4 h-4 text-muted-foreground" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="start" className="w-56">
									<DropdownMenuLabel>Workspaces</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem>
										<div className="flex items-center gap-2">
											<div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
												<Layers className="w-3 h-3 text-primary-foreground" />
											</div>
											<span>My Workspace</span>
										</div>
									</DropdownMenuItem>
									<DropdownMenuItem>
										<div className="flex items-center gap-2">
											<div className="w-6 h-6 bg-muted rounded-md flex items-center justify-center">
												<Layers className="w-3 h-3" />
											</div>
											<span>Team Workspace</span>
										</div>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={() => setIsCreateWorkspaceOpen(true)}
									>
										<Plus className="w-4 h-4 mr-2" />
										Create workspace
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
							<Button
								variant="ghost"
								size="icon"
								className="h-10 w-10 shrink-0"
								onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
								title="Collapse sidebar"
							>
								<PanelLeftClose className="w-4 h-4" />
							</Button>
						</>
					) : (
						<>
							<Button
								variant="ghost"
								size="icon"
								className="h-10 w-10"
								onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
								title="Expand sidebar"
							>
								<PanelLeft className="w-4 h-4" />
							</Button>
						</>
					)}
				</div>

				<div className="flex-1 overflow-y-auto p-4">
					<div className="space-y-6">
						<div>
							{!isSidebarCollapsed && (
								<div className="flex items-center justify-between mb-3">
									<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
										Projects
									</h3>
									<Button
										variant="ghost"
										size="icon"
										className="h-6 w-6"
										onClick={() => setIsCreateProjectOpen(true)}
									>
										<Plus className="w-4 h-4" />
									</Button>
								</div>
							)}
							<div className="space-y-1">
								<Link
									to="/dashboard/project/1"
									className={`flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent text-sm transition-colors ${isSidebarCollapsed ? "justify-center" : ""}`}
									title={isSidebarCollapsed ? "Product Roadmap Q1" : undefined}
								>
									<Layers className="w-4 h-4 text-muted-foreground shrink-0" />
									{!isSidebarCollapsed && <span>Product Roadmap Q1</span>}
								</Link>
								<Link
									to="/dashboard/project/2"
									className={`flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent text-sm transition-colors ${isSidebarCollapsed ? "justify-center" : ""}`}
									title={isSidebarCollapsed ? "Sprint Planning" : undefined}
								>
									<Kanban className="w-4 h-4 text-muted-foreground shrink-0" />
									{!isSidebarCollapsed && <span>Sprint Planning</span>}
								</Link>
								<Link
									to="/dashboard/project/3"
									className={`flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent text-sm transition-colors ${isSidebarCollapsed ? "justify-center" : ""}`}
									title={
										isSidebarCollapsed ? "Design System Updates" : undefined
									}
								>
									<Layers className="w-4 h-4 text-muted-foreground shrink-0" />
									{!isSidebarCollapsed && <span>Design System Updates</span>}
								</Link>
							</div>
						</div>
					</div>
				</div>

				<div className="p-4 border-t border-border space-y-1">
					<Link
						to="/dashboard/team"
						className={`flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent text-sm transition-colors ${isSidebarCollapsed ? "justify-center" : ""}`}
						title={isSidebarCollapsed ? "Team Members" : undefined}
					>
						<Users className="w-4 h-4 text-muted-foreground shrink-0" />
						{!isSidebarCollapsed && <span>Team Members</span>}
					</Link>
					<Link
						to="/dashboard/settings"
						className={`flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent text-sm transition-colors ${isSidebarCollapsed ? "justify-center" : ""}`}
						title={isSidebarCollapsed ? "Settings" : undefined}
					>
						<Settings className="w-4 h-4 text-muted-foreground shrink-0" />
						{!isSidebarCollapsed && <span>Settings</span>}
					</Link>
				</div>
			</aside>

			{/* Main Content */}
			<div className="flex-1 flex flex-col">
				{/* Top Navigation */}
				<header className="h-14 border-b border-border flex items-center justify-between px-6">
					<div className="flex items-center gap-4 flex-1 max-w-xl">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
							<Input
								placeholder="Search projects, tasks..."
								className="pl-9 h-9 bg-background"
							/>
						</div>
					</div>

					<div className="flex items-center gap-3">
						<ThemeToggle />

						<Button variant="ghost" size="icon" className="relative">
							<Bell className="w-5 h-5" />
							<span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
						</Button>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" className="gap-2 h-9 px-2">
									<Avatar className="w-6 h-6">
										<AvatarImage src="/placeholder.svg?height=24&width=24" />
										<AvatarFallback>JD</AvatarFallback>
									</Avatar>
									<span className="text-sm">John Doe</span>
									<ChevronDown className="w-4 h-4 text-muted-foreground" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56">
								<DropdownMenuLabel>My Account</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link to="/dashboard/settings" className="cursor-pointer">
										Profile
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link to="/dashboard/settings" className="cursor-pointer">
										Settings
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link
										to="/dashboard/workspace/settings"
										className="cursor-pointer"
									>
										Workspace Settings
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link to="/login" className="cursor-pointer">
										Log out
									</Link>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</header>

				{/* Dashboard Content */}
				<main className="flex-1 overflow-y-auto p-6">
					<div className="max-w-7xl mx-auto space-y-8">
						{/* Header */}
						<div>
							<h1 className="text-3xl font-bold mb-2">Welcome back, John</h1>
							<p className="text-muted-foreground">
								Here's what's happening with your projects today
							</p>
						</div>

						{/* Quick Actions */}
						<div className="grid md:grid-cols-2 gap-4">
							<Card
								className="p-6 bg-card border-border hover:border-muted-foreground/20 transition-colors cursor-pointer group"
								onClick={() => setIsCreateProjectOpen(true)}
							>
								<div className="flex items-start justify-between mb-4">
									<div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
										<Plus className="w-6 h-6 text-primary" />
									</div>
								</div>
								<h3 className="text-lg font-semibold mb-2">
									Create New Project
								</h3>
								<p className="text-sm text-muted-foreground">
									Start a new project with Decision Board and Task Board
								</p>
							</Card>

							<Card className="p-6 bg-card border-border hover:border-muted-foreground/20 transition-colors">
								<div className="flex items-start justify-between mb-4">
									<div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
										<Users className="w-6 h-6 text-primary" />
									</div>
								</div>
								<h3 className="text-lg font-semibold mb-2">
									Invite Team Members
								</h3>
								<p className="text-sm text-muted-foreground">
									Collaborate with your team in real-time
								</p>
							</Card>
						</div>

						{/* Recent Projects */}
						<div>
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-xl font-semibold">Recent Projects</h2>
								<Button variant="ghost" size="sm">
									View all
								</Button>
							</div>

							{recentProjects.length === 0 ? (
								<NoProjectsEmpty
									onCreateProject={() => setIsCreateProjectOpen(true)}
								/>
							) : (
								<div className="grid gap-4">
									{recentProjects.map((project) => (
										<Link
											key={project.id}
											to={`/dashboard/project/${project.id}`}
										>
											<Card className="p-5 bg-card border-border hover:border-muted-foreground/20 transition-colors cursor-pointer">
												<div className="flex items-start justify-between">
													<div className="flex items-start gap-4 flex-1">
														<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
															<Layers className="w-5 h-5 text-primary" />
														</div>
														<div className="flex-1">
															<div className="flex items-center gap-2 mb-1">
																<h3 className="font-semibold">
																	{project.name}
																</h3>
																<Badge variant="secondary" className="text-xs">
																	Project
																</Badge>
															</div>
															<div className="flex items-center gap-4 text-sm text-muted-foreground">
																<div className="flex items-center gap-1">
																	<Clock className="w-4 h-4" />
																	<span>{project.lastUpdated}</span>
																</div>
																<div className="flex items-center -space-x-2">
																	{project.members
																		.slice(0, 3)
																		.map((member, idx) => (
																			<Avatar
																				key={idx}
																				className="w-6 h-6 border-2 border-background"
																			>
																				<AvatarImage
																					src={
																						member.avatar || "/placeholder.svg"
																					}
																				/>
																				<AvatarFallback>
																					{member.name[0]}
																				</AvatarFallback>
																			</Avatar>
																		))}
																	{project.members.length > 3 && (
																		<div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
																			<span className="text-xs">
																				+{project.members.length - 3}
																			</span>
																		</div>
																	)}
																</div>
															</div>
														</div>
													</div>
													<Button
														variant="ghost"
														size="icon"
														className="shrink-0"
													>
														<MoreHorizontal className="w-4 h-4" />
													</Button>
												</div>
											</Card>
										</Link>
									))}
								</div>
							)}
						</div>

						{/* Activity Feed */}
						<div>
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-xl font-semibold">Recent Activity</h2>
							</div>

							<Card className="divide-y divide-border">
								{activities.map((activity) => (
									<div
										key={activity.id}
										className="p-4 hover:bg-accent/50 transition-colors"
									>
										<div className="flex items-start gap-3">
											<Avatar className="w-8 h-8 shrink-0">
												<AvatarImage src="/placeholder.svg?height=32&width=32" />
												<AvatarFallback>{activity.user[0]}</AvatarFallback>
											</Avatar>
											<div className="flex-1 min-w-0">
												<p className="text-sm">
													<span className="font-medium">{activity.user}</span>{" "}
													<span className="text-muted-foreground">
														{activity.action}
													</span>{" "}
													<span className="font-medium">{activity.target}</span>
												</p>
												<div className="flex items-center gap-2 mt-1">
													<span className="text-xs text-muted-foreground">
														{activity.project}
													</span>
													<span className="text-xs text-muted-foreground">
														•
													</span>
													<span className="text-xs text-muted-foreground">
														{activity.time}
													</span>
												</div>
											</div>
										</div>
									</div>
								))}
							</Card>
						</div>
					</div>
				</main>
			</div>

			<Dialog
				open={isCreateWorkspaceOpen}
				onOpenChange={setIsCreateWorkspaceOpen}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create Workspace</DialogTitle>
						<DialogDescription>
							Create a new workspace to organize your projects and collaborate
							with your team.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="workspace-name">Workspace Name</Label>
							<Input
								id={"workspace-name"}
								placeholder="Enter workspace name"
								value={workspaceName}
								onChange={(e) => setWorkspaceName(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="workspace-description">
								Description (optional)
							</Label>
							<Textarea
								id={"workspace-description"}
								placeholder="What's this workspace for?"
								value={workspaceDescription}
								onChange={(e) => setWorkspaceDescription(e.target.value)}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsCreateWorkspaceOpen(false)}
						>
							Cancel
						</Button>
						<Button
							onClick={handleCreateWorkspace}
							disabled={!workspaceName.trim()}
						>
							Create Workspace
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create New Project</DialogTitle>
						<DialogDescription>
							Give your project a name to get started. Both Decision Board and
							Task Board will be available.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="project-name">Project Name</Label>
							<Input
								id={"project-name"}
								placeholder="Enter project name"
								value={projectName}
								onChange={(e) => setProjectName(e.target.value)}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsCreateProjectOpen(false)}
						>
							Cancel
						</Button>
						<Button
							onClick={handleCreateProject}
							disabled={!projectName.trim()}
						>
							Create Project
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
