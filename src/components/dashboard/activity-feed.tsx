import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useWorkspace } from "@/lib/workspace-context";
import { NoActivitiesEmpty } from "@/components/empty-states";

export default function ActivityFeed() {
	const workspace = useWorkspace();

	const recentActivities =
		useQuery(api.workspace.getRecentActivities, {
			workspaceId: workspace?.id || "",
		}) || [];

	// const activities = [
	// 	{
	// 		id: 1,
	// 		user: "Alice",
	// 		action: "created a new task",
	// 		target: "Implement authentication",
	// 		project: "Sprint Planning",
	// 		time: "10 minutes ago",
	// 	},
	// 	{
	// 		id: 2,
	// 		user: "Bob",
	// 		action: "added a note to",
	// 		target: "Product Roadmap Q1",
	// 		project: "Product Roadmap Q1",
	// 		time: "1 hour ago",
	// 	},
	// 	{
	// 		id: 3,
	// 		user: "Charlie",
	// 		action: "completed",
	// 		target: "Design review",
	// 		project: "Design System Updates",
	// 		time: "3 hours ago",
	// 	},
	// ];

	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl font-semibold">Recent Activity</h2>
			</div>

			<Card>
				{recentActivities.length === 0 ? (
					<NoActivitiesEmpty />
				) : (
					<div className="divide-y divide-border">
						{recentActivities.map((activity) => (
							<div
								key={activity.id}
								className="p-4 hover:bg-accent/50 transition-colors"
							>
								<div className="flex items-start gap-3">
									<Avatar className="w-8 h-8 shrink-0">
										<AvatarImage src="/placeholder.svg?height=32&width=32" />
										<AvatarFallback>{activity.userName[0]}</AvatarFallback>
									</Avatar>
									<div className="flex-1 min-w-0">
										<p className="text-sm">
											<span className="font-medium">{activity.userName}</span>{" "}
											<span className="text-muted-foreground">
												{activity.message}
											</span>{" "}
											{activity.taskTitle && (
												<span className="font-medium">{activity.taskTitle}</span>
											)}
										</p>
										<div className="flex items-center gap-2 mt-1">
											<span className="text-xs text-muted-foreground">
												{activity.projectName}
											</span>
											<span className="text-xs text-muted-foreground">•</span>
											<span className="text-xs text-muted-foreground">
												{activity.relativeTime}
											</span>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</Card>
		</div>
	);
}
