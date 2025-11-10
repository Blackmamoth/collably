import {
	createFileRoute,
	useParams,
	Link,
	redirect,
} from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	ArrowLeft,
	Settings,
	Users,
	Layers,
	Kanban,
	Clock,
	TrendingUp,
	CheckCircle2,
	MoreVertical,
} from "lucide-react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";

export const Route = createFileRoute("/dashboard/project/$projectId/")({
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
	const params = useParams({ from: Route.id });

	const { project } = Route.useLoaderData();

	const workspaceMembers = useQuery(api.workspace.getWorkspaceMembers);

	// Mock data
	// const project = {
	// 	id: params.projectId,
	// 	name: "Product Roadmap Q1",
	// 	description: "Planning and brainstorming for Q1 product initiatives",
	// 	members: [
	// 		{
	// 			name: "Alice",
	// 			avatar: "/placeholder.svg?height=32&width=32",
	// 			role: "Owner",
	// 		},
	// 		{
	// 			name: "Bob",
	// 			avatar: "/placeholder.svg?height=32&width=32",
	// 			role: "Member",
	// 		},
	// 		{
	// 			name: "Charlie",
	// 			avatar: "/placeholder.svg?height=32&width=32",
	// 			role: "Member",
	// 		},
	// 	],
	// 	stats: {
	// 		notes: 12,
	// 		tasks: 8,
	// 		completed: 3,
	// 		inProgress: 5,
	// 	},
	// 	recentActivity: [
	// 		{ user: "Alice", action: "added a note", time: "2 hours ago" },
	// 		{ user: "Bob", action: "completed a task", time: "5 hours ago" },
	// 		{ user: "Charlie", action: "moved a task", time: "1 day ago" },
	// 	],
	// };

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="border-b border-border">
				<div className="max-w-7xl mx-auto px-6 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<Link to="/dashboard">
								<Button variant="ghost" size="icon">
									<ArrowLeft className="w-5 h-5" />
								</Button>
							</Link>
							<div>
								<h1 className="text-2xl font-bold">{project.name}</h1>
								<p className="text-sm text-muted-foreground">
									{project.description}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-2">
							{workspaceMembers && workspaceMembers.members.length > 0 && (
								<div className="flex items-center -space-x-2 mr-2">
									{workspaceMembers.members.map((member) => (
										<Avatar
											key={member.id}
											className="w-8 h-8 border-2 border-background"
										>
											<AvatarImage
												src={member.user.image || "/placeholder.svg"}
											/>
											<AvatarFallback>{member.user.name[0]}</AvatarFallback>
										</Avatar>
									))}
								</div>
							)}

							<Link
								to={`/dashboard/project/$projectId/settings`}
								params={params}
							>
								<Button variant="outline" size="sm">
									<Settings className="w-4 h-4 mr-2" />
									Settings
								</Button>
							</Link>

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
									<DropdownMenuItem>Export project</DropdownMenuItem>
									<DropdownMenuItem className="text-destructive">
										Archive project
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto px-6 py-8">
				<div className="space-y-8">
					{/* Boards */}
					<div>
						<h2 className="text-lg font-semibold mb-4">Boards</h2>
						<div className="grid md:grid-cols-2 gap-4">
							<Link
								to={`/dashboard/project/$projectId/decision-board`}
								params={params}
							>
								<Card className="p-6 bg-card border-border hover:border-muted-foreground/20 transition-colors cursor-pointer group">
									<div className="flex items-start justify-between mb-4">
										<div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
											<Layers className="w-6 h-6 text-primary" />
										</div>
										<Badge variant="secondary">
											{/*{project.stats.notes} notes*/}
										</Badge>
									</div>
									<h3 className="text-lg font-semibold mb-2">Decision Board</h3>
									<p className="text-sm text-muted-foreground">
										Brainstorm with sticky notes and collaborate in real-time
									</p>
								</Card>
							</Link>

							<Link
								to={`/dashboard/project/$projectId/task-board`}
								params={params}
							>
								<Card className="p-6 bg-card border-border hover:border-muted-foreground/20 transition-colors cursor-pointer group">
									<div className="flex items-start justify-between mb-4">
										<div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
											<Kanban className="w-6 h-6 text-primary" />
										</div>
										<Badge variant="secondary">
											{/*{project.stats.tasks} tasks*/}
										</Badge>
									</div>
									<h3 className="text-lg font-semibold mb-2">Task Board</h3>
									<p className="text-sm text-muted-foreground">
										Manage tasks with Kanban-style workflow
									</p>
								</Card>
							</Link>
						</div>
					</div>

					{/* Stats */}
					<div>
						<h2 className="text-lg font-semibold mb-4">Project Stats</h2>
						<div className="grid md:grid-cols-4 gap-4">
							<Card className="p-4 bg-card border-border">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
										<Layers className="w-5 h-5 text-blue-500" />
									</div>
									<div>
										{/*<p className="text-2xl font-bold">{project.stats.notes}</p>*/}
										<p className="text-xs text-muted-foreground">Total Notes</p>
									</div>
								</div>
							</Card>

							<Card className="p-4 bg-card border-border">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
										<Kanban className="w-5 h-5 text-purple-500" />
									</div>
									<div>
										{/*<p className="text-2xl font-bold">{project.stats.tasks}</p>*/}
										<p className="text-xs text-muted-foreground">Total Tasks</p>
									</div>
								</div>
							</Card>

							<Card className="p-4 bg-card border-border">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
										<CheckCircle2 className="w-5 h-5 text-green-500" />
									</div>
									<div>
										<p className="text-2xl font-bold">
											{/*{project.stats.completed}*/}
										</p>
										<p className="text-xs text-muted-foreground">Completed</p>
									</div>
								</div>
							</Card>

							<Card className="p-4 bg-card border-border">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
										<TrendingUp className="w-5 h-5 text-orange-500" />
									</div>
									<div>
										<p className="text-2xl font-bold">
											{/*{project.stats.inProgress}*/}
										</p>
										<p className="text-xs text-muted-foreground">In Progress</p>
									</div>
								</div>
							</Card>
						</div>
					</div>

					{/* Team & Activity */}
					<div className="grid md:grid-cols-2 gap-6">
						{/* Team Members */}
						{workspaceMembers && workspaceMembers?.members?.length > 0 && (
							<div>
								<h2 className="text-lg font-semibold mb-4">Team Members</h2>
								<Card className="divide-y divide-border">
									{workspaceMembers?.members?.map((member, idx) => (
										<div
											key={idx}
											className="p-4 flex items-center justify-between"
										>
											<div className="flex items-center gap-3">
												<Avatar className="w-10 h-10">
													<AvatarImage
														src={member.user.image || "/placeholder.svg"}
													/>
													<AvatarFallback>{member.user.name[0]}</AvatarFallback>
												</Avatar>
												<div>
													<p className="font-medium text-sm">
														{member.user.name}
													</p>
													<p className="text-xs text-muted-foreground">
														{member.role}
													</p>
												</div>
											</div>
										</div>
									))}
								</Card>
							</div>
						)}

						{/* Recent Activity */}
						{/*<div>
							<h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
							<Card className="divide-y divide-border">
								{project.recentActivity.map((activity, idx) => (
									<div key={idx} className="p-4">
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
													</span>
												</p>
												<div className="flex items-center gap-2 mt-1">
													<Clock className="w-3 h-3 text-muted-foreground" />
													<span className="text-xs text-muted-foreground">
														{activity.time}
													</span>
												</div>
											</div>
										</div>
									</div>
								))}
							</Card>
						</div>*/}
					</div>
				</div>
			</main>
		</div>
	);
}
