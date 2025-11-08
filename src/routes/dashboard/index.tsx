import {
	createFileRoute,
	Link,
	redirect,
	useRouteContext,
} from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import DashboardSidebar from "@/components/dashboard/sidebar";
import DashboardTopNavigation from "@/components/dashboard/top-navigation";
import DashboardQuickActions from "@/components/dashboard/quick-actions";
import RecentProjects from "@/components/dashboard/recent-projects";
import ActivityFeed from "@/components/dashboard/activity-feed";
import CreateWorkSpaceDialog from "@/components/dashboard/create-workspace-dialog";
import CreateProjectDialog from "@/components/dashboard/create-project-dialog";
import { useWorkspace } from "@/lib/workspace-context";

export const Route = createFileRoute("/dashboard/")({
	component: RouteComponent,
	beforeLoad: ({ context }) => {
		const { user } = context;

		if (user === undefined) {
			throw redirect({ to: "/login" });
		}

		return { user };
	},
});

function RouteComponent() {
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
	const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
	const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

	const activeWorkspace = useWorkspace();

	const { user } = useRouteContext({ from: Route.id });

	const workspaces = useQuery(api.workspace.getWorkspaces) || [];
	const projects =
		useQuery(api.project.getProjects, {
			workspaceId: activeWorkspace?.id || "",
		}) || [];

	return (
		<div className="min-h-screen bg-background flex">
			<DashboardSidebar
				projects={projects}
				workspaces={workspaces}
				isSidebarCollapsed={isSidebarCollapsed}
				setIsSidebarCollapsed={setIsSidebarCollapsed}
				setIsCreateProjectOpen={setIsCreateProjectOpen}
				setIsCreateWorkspaceOpen={setIsCreateWorkspaceOpen}
			/>

			{/* Main Content */}
			<div className="flex-1 flex flex-col">
				{/* Top Navigation */}
				<DashboardTopNavigation name={user.name} image={user.image} />

				{/* Dashboard Content */}
				<main className="flex-1 overflow-y-auto p-6">
					<div className="max-w-7xl mx-auto space-y-8">
						{/* Header */}
						<div>
							<h1 className="text-3xl font-bold mb-2">
								Welcome back, {user.name.split(" ")[0]}
							</h1>
							<p className="text-muted-foreground">
								Here's what's happening with your projects today
							</p>
						</div>

						{/* Quick Actions */}
						<DashboardQuickActions
							setIsCreateProjectOpen={setIsCreateProjectOpen}
						/>

						{/* Recent Projects */}
						<RecentProjects setIsCreateProjectOpen={setIsCreateProjectOpen} />

						{/* Activity Feed */}
						<ActivityFeed />
					</div>
				</main>
			</div>

			<CreateWorkSpaceDialog
				isCreateWorkspaceOpen={isCreateWorkspaceOpen}
				setIsCreateWorkspaceOpen={setIsCreateWorkspaceOpen}
				userId={user.id}
			/>

			<CreateProjectDialog
				isCreateProjectOpen={isCreateProjectOpen}
				setIsCreateProjectOpen={setIsCreateProjectOpen}
			/>
		</div>
	);
}
