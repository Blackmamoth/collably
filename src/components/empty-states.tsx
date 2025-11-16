import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Layers, Users, FolderOpen, Inbox, Clock } from "lucide-react";

interface EmptyStateProps {
	icon?: ReactNode;
	title: string;
	description: string;
	action?: {
		label: string;
		onClick: () => void;
	};
}

export function EmptyState({
	icon,
	title,
	description,
	action,
}: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center justify-center py-16 px-6 text-center">
			{icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
			<h3 className="text-lg font-semibold mb-2">{title}</h3>
			<p className="text-sm text-muted-foreground mb-6 max-w-md">
				{description}
			</p>
			{action && <Button onClick={action.onClick}>{action.label}</Button>}
		</div>
	);
}

export function NoWorkspacesEmpty({
	onCreateWorkspace,
}: {
	onCreateWorkspace: () => void;
}) {
	return (
		<EmptyState
			icon={<Layers className="w-16 h-16" />}
			title="No workspaces yet"
			description="Create your first workspace to start collaborating with your team on projects and boards."
			action={{
				label: "Create Workspace",
				onClick: onCreateWorkspace,
			}}
		/>
	);
}

export function NoProjectsEmpty({
	onCreateProject,
}: {
	onCreateProject: () => void;
}) {
	return (
		<EmptyState
			icon={<FolderOpen className="w-16 h-16" />}
			title="No projects yet"
			description="Start your first project to organize your work with Decision Boards and Task Boards."
			action={{
				label: "Create Project",
				onClick: onCreateProject,
			}}
		/>
	);
}

export function NoTasksEmpty({
	columnName,
	onAddTask,
}: {
	columnName: string;
	onAddTask: () => void;
}) {
	return (
		<div className="flex flex-col items-center justify-center py-8 px-4 text-center">
			<Inbox className="w-12 h-12 text-muted-foreground mb-3" />
			<p className="text-sm text-muted-foreground mb-3">
				No tasks in {columnName}
			</p>
			<Button variant="ghost" size="sm" onClick={onAddTask}>
				Add task
			</Button>
		</div>
	);
}

export function NoNotesEmpty({ onAddNote }: { onAddNote: () => void }) {
	return (
		<div className="absolute inset-0 flex flex-col items-center justify-center">
			<div className="text-center max-w-md">
				<Layers className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
				<h3 className="text-lg font-semibold mb-2">Start brainstorming</h3>
				<p className="text-sm text-muted-foreground mb-6">
					Add your first sticky note to capture ideas and collaborate with your
					team in real-time.
				</p>
				<Button onClick={onAddNote}>Add your first note</Button>
			</div>
		</div>
	);
}

export function NoTeamMembersEmpty({ onInvite }: { onInvite: () => void }) {
	return (
		<EmptyState
			icon={<Users className="w-16 h-16" />}
			title="No team members yet"
			description="Invite your team to collaborate on projects and boards together."
			action={{
				label: "Invite Team Members",
				onClick: onInvite,
			}}
		/>
	);
}

export function NoSearchResultsEmpty({ query }: { query: string }) {
	return (
		<div className="flex flex-col items-center justify-center py-12 px-6 text-center">
			<Inbox className="w-12 h-12 text-muted-foreground mb-3" />
			<h3 className="text-lg font-semibold mb-2">No results found</h3>
			<p className="text-sm text-muted-foreground max-w-md">
				We couldn't find anything matching "{query}". Try adjusting your search.
			</p>
		</div>
	);
}

export function NoActivitiesEmpty() {
	return (
		<EmptyState
			icon={<Clock className="w-16 h-16" />}
			title="No recent activity"
			description="Activity from your team will appear here as you work on projects and tasks."
		/>
	);
}
