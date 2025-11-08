import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import {
	Layers,
	ChevronDown,
	Plus,
	Settings,
	Users,
	PanelLeftClose,
	PanelLeft,
} from "lucide-react";
import type { SetStateAction } from "react";
import { Link } from "@tanstack/react-router";
import type { Project, Workspace } from "@/lib/common/types";
import { setCurrentWorkspace } from "@/lib/common/helper";
import { useWorkspace } from "@/lib/workspace-context";

interface Props {
	projects: Project[];
	workspaces: Workspace[];
	isSidebarCollapsed: boolean;
	setIsSidebarCollapsed: React.Dispatch<SetStateAction<boolean>>;
	setIsCreateWorkspaceOpen: React.Dispatch<SetStateAction<boolean>>;
	setIsCreateProjectOpen: React.Dispatch<SetStateAction<boolean>>;
}

export default function DashboardSidebar({
	projects,
	workspaces,
	isSidebarCollapsed,
	setIsSidebarCollapsed,
	setIsCreateWorkspaceOpen,
	setIsCreateProjectOpen,
}: Props) {
	const activeWorkspace = useWorkspace();

	const currentWorkspace =
		activeWorkspace !== null ? activeWorkspace.name : "My Workspaces";

	return (
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
									className="flex-1 justify-between h-10 px-3 min-w-0"
								>
									<div className="flex items-center gap-2 min-w-0 flex-1">
										<div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center shrink-0">
											<Layers className="w-4 h-4 text-primary-foreground" />
										</div>
										<span className="font-semibold text-sm truncate">
											{currentWorkspace}
										</span>
									</div>
									<ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="w-56">
								<DropdownMenuLabel>Workspaces</DropdownMenuLabel>
								<DropdownMenuSeparator />
								{workspaces.map((workspace) => (
									<DropdownMenuItem
										key={workspace.id}
										onClick={() => setCurrentWorkspace(workspace.id)}
									>
										<div className="flex items-center gap-2">
											<div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
												<Layers className="w-3 h-3 text-primary-foreground" />
											</div>
											<span>{workspace.name}</span>
										</div>
									</DropdownMenuItem>
								))}
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
					<Button
						variant="ghost"
						size="icon"
						className="h-10 w-10"
						onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
						title="Expand sidebar"
					>
						<PanelLeft className="w-4 h-4" />
					</Button>
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
							{projects.map((project) => (
								<Link
									key={project._id}
									to="/dashboard/project/$projectId"
									params={{ projectId: project._id }}
									className={`flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent text-sm transition-colors ${isSidebarCollapsed ? "justify-center" : ""}`}
									title={isSidebarCollapsed ? project.name : undefined}
								>
									<Layers className="w-4 h-4 text-muted-foreground shrink-0" />
									{!isSidebarCollapsed && (
										<span className="truncate">{project.name}</span>
									)}
								</Link>
							))}
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
					{!isSidebarCollapsed && (
						<span className="truncate">Team Members</span>
					)}
				</Link>
				<Link
					to="/dashboard/workspace/settings"
					className={`flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent text-sm transition-colors ${isSidebarCollapsed ? "justify-center" : ""}`}
					title={isSidebarCollapsed ? "Workspace Settings" : undefined}
				>
					<Settings className="w-4 h-4 text-muted-foreground shrink-0" />
					{!isSidebarCollapsed && (
						<span className="truncate">Workspace Settings</span>
					)}
				</Link>
				<Link
					to="/dashboard/settings"
					className={`flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent text-sm transition-colors ${isSidebarCollapsed ? "justify-center" : ""}`}
					title={isSidebarCollapsed ? "User Settings" : undefined}
				>
					<Settings className="w-4 h-4 text-muted-foreground shrink-0" />
					{!isSidebarCollapsed && (
						<span className="truncate">User Settings</span>
					)}
				</Link>
			</div>
		</aside>
	);
}
