import { Badge } from "@/components/ui/badge";
import { Layers, Clock, MoreHorizontal } from "lucide-react";
import { NoProjectsEmpty } from "@/components/empty-states";
import type { SetStateAction } from "react";
import { Button } from "../ui/button";
import { Link } from "@tanstack/react-router";
import { Card } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface Props {
	setIsCreateProjectOpen: React.Dispatch<SetStateAction<boolean>>;
}

export default function RecentProjects({ setIsCreateProjectOpen }: Props) {
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

	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl font-semibold">Recent Projects</h2>
				<Button variant="ghost" size="sm">
					View all
				</Button>
			</div>

			{recentProjects.length === 0 ? (
				<NoProjectsEmpty onCreateProject={() => setIsCreateProjectOpen(true)} />
			) : (
				<div className="grid gap-4">
					{recentProjects.map((project) => (
						<Link
							key={project.id}
							to={`/dashboard/project/$projectId`}
							params={{ projectId: String(project.id) }}
						>
							<Card className="p-5 bg-card border-border hover:border-muted-foreground/20 transition-colors cursor-pointer">
								<div className="flex items-start justify-between">
									<div className="flex items-start gap-4 flex-1">
										<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
											<Layers className="w-5 h-5 text-primary" />
										</div>
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-1">
												<h3 className="font-semibold">{project.name}</h3>
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
													{project.members.slice(0, 3).map((member) => (
														<Avatar
															key={member.name}
															className="w-6 h-6 border-2 border-background"
														>
															<AvatarImage
																src={member.avatar || "/placeholder.svg"}
															/>
															<AvatarFallback>{member.name[0]}</AvatarFallback>
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
									<Button variant="ghost" size="icon" className="shrink-0">
										<MoreHorizontal className="w-4 h-4" />
									</Button>
								</div>
							</Card>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
