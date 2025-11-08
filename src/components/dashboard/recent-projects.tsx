import { Badge } from "@/components/ui/badge";
import { Layers, Clock } from "lucide-react";
import { NoProjectsEmpty } from "@/components/empty-states";
import type { SetStateAction } from "react";
import { Button } from "../ui/button";
import { Link } from "@tanstack/react-router";
import { Card } from "../ui/card";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useWorkspace } from "@/lib/workspace-context";
import { formatDistanceToNow } from "date-fns";

interface Props {
	setIsCreateProjectOpen: React.Dispatch<SetStateAction<boolean>>;
}

export default function RecentProjects({ setIsCreateProjectOpen }: Props) {
	const activeWorkspace = useWorkspace();

	const recentProjects =
		useQuery(api.project.getProjects, {
			workspaceId: activeWorkspace?.id || "",
			limit: 3,
			sortOrder: "desc",
		}) || [];

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
							key={project._id}
							to={`/dashboard/project/$projectId`}
							params={{ projectId: String(project._id) }}
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
													<span>
														{formatDistanceToNow(project.updatedAt, {
															addSuffix: true,
														})}
													</span>
												</div>
											</div>
										</div>
									</div>
								</div>
							</Card>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
