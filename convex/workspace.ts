import { ConvexError, v } from "convex/values";
import { formatDistanceToNow } from "date-fns";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { authComponent, createAuth } from "./auth";
import { validateProjectAccess } from "./helpers/authorization";

export const getWorkspaces = query({
	args: {},
	handler: async (ctx, args) => {
		const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
		const workspaces = await auth.api.listOrganizations({ headers: headers });
		return workspaces;
	},
});

export const getWorkspaceMembers = query({
	args: {},
	handler: async (ctx, args) => {
		const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
		const workspaceMembers = await auth.api.listMembers({ headers: headers });
		return workspaceMembers;
	},
});

export const getWorkspaceInvitations = query({
	args: {},
	handler: async (ctx, args) => {
		const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
		const workspaceInvitations = await auth.api.listInvitations({
			headers: headers,
		});
		return workspaceInvitations;
	},
});

export const deleteWorkspace = mutation({
	args: {},
	handler: async (ctx, args) => {
		const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

		const member = await auth.api.getActiveMember({ headers });
		if (!member) {
			throw new ConvexError(
				"you do not belong to the workspace you want to delete",
			);
		}

		// Check permission to delete workspace/organization
		const permissionResult = await auth.api.hasPermission({
			headers,
			body: {
				permissions: {
					organization: ["delete"],
				},
			},
		});

		if (!permissionResult.success) {
			throw new ConvexError("you do not have permission to delete the workspace");
		}

		await auth.api.deleteOrganization({
			headers,
			body: { organizationId: member.organizationId },
		});
	},
});

export const createActivityLog = mutation({
	args: {
		workspaceId: v.string(),
		projectId: v.id("project"),
		taskId: v.optional(v.id("task")),
		elementId: v.optional(v.id("element")),

		action: v.union(
			// workspace
			v.literal("workspace_created"),
			v.literal("workspace_updated"),
			v.literal("workspace_deleted"),
			v.literal("workspace_plan_updated"),
			v.literal("workspace_member_invited"),
			v.literal("workspace_member_removed"),
			v.literal("workspace_member_role_changed"),

			// project
			v.literal("project_created"),
			v.literal("project_updated"),
			v.literal("project_deleted"),

			// task
			v.literal("task_created"),
			v.literal("task_updated"),
			v.literal("task_deleted"),
			v.literal("task_moved"),
			v.literal("task_completed"),
			v.literal("task_reopened"),
			// v.literal("task_subtask_added"),
			// v.literal("task_subtask_completed"),

			// element
			v.literal("element_created"),

			// comments
			v.literal("comment_added"),
		),
	},
	handler: async (ctx, args) => {
		const { member } = await validateProjectAccess(ctx, args.projectId);

		await ctx.db.insert("activityLog", { ...args, memberId: member.id });
	},
});

export const getRecentActivities = query({
	args: { workspaceId: v.string() },
	handler: async (ctx, args) => {
		try {
			const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
			const { _id } = await authComponent.getAuthUser(ctx);
			await auth.api.getActiveMember({ headers });
			const members = await auth.api.listMembers({ headers });
			const memberMap = new Map<string, string>();
			for (const m of members.members) {
				memberMap.set(m.id, m.user.name ?? "Member");
			}
			const logs = await ctx.db
				.query("activityLog")
				.withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
				.order("desc")
				.take(5);

			// Batch fetch all projects and tasks to avoid N+1 queries
			const projectIds = new Set<Id<"project">>();
			const taskIds = new Set<Id<"task">>();
			for (const log of logs) {
				if (log.projectId) {
					projectIds.add(log.projectId);
				}
				if (log.taskId) {
					taskIds.add(log.taskId);
				}
			}

			// Fetch all projects in batch
			const projectMap = new Map<string, string>();
			for (const projectId of projectIds) {
				const project = await ctx.db.get(projectId);
				if (project) {
					projectMap.set(projectId, project.name);
				}
			}

			// Fetch all tasks in batch
			const taskMap = new Map<string, string>();
			for (const taskId of taskIds) {
				const task = await ctx.db.get(taskId);
				if (task) {
					taskMap.set(taskId, task.title);
				}
			}

			const formatted = [];
			for (const log of logs) {
				// Project name lookup (optional)
				const projectName = log.projectId
					? projectMap.get(log.projectId) ?? null
					: null;

				const taskTitle = log.taskId ? taskMap.get(log.taskId) ?? null : null;

				const userName = memberMap.get(log.memberId);
				const message = formatActivityMessage(log.action);
				const relative = formatDistanceToNow(log._creationTime, {
					addSuffix: true,
				});
				formatted.push({
					id: log._id,
					userName: userName || "Member",
					message,
					projectName,
					taskTitle,
					timestamp: log._creationTime,
					relativeTime: relative,
				});
			}
			return formatted;
		} catch (error: unknown) {
			console.error("Error fetching recent activities:", error);
			return [];
		}
	},
});

function formatActivityMessage(action: string) {
	switch (action) {
		// WORKSPACE
		case "workspace_created":
			return "created a new workspace";
		case "workspace_updated":
			return "updated workspace settings";
		case "workspace_deleted":
			return "deleted a workspace";
		case "workspace_member_invited":
			return "invited a member to the workspace";
		case "workspace_member_removed":
			return "removed a member from the workspace";
		case "workspace_member_role_changed":
			return "changed a member's role";

		// PROJECT
		case "project_created":
			return "created a new project";
		case "project_updated":
			return "updated a project";
		case "project_deleted":
			return "deleted a project";

		// TASK
		case "task_created":
			return "created a new task";
		case "task_deleted":
			return "deleted a task";
		case "task_completed":
			return "completed a task";
		case "task_reopened":
			return "reopened a task";
		case "task_moved":
			return "moved a task";

		// BOARD ELEMENTS (Decision Board)
		case "element_created":
			return "added a new note";

		// COMMENTS
		case "comment_added":
			return "added a comment";

		// // AI
		// case "ai_summary_generated":
		// 	return "generated an AI summary";
		// case "ai_subtasks_generated":
		// 	return "generated AI subtasks";
		// case "ai_credits_exhausted":
		// 	return "ran out of AI credits";

		// // BILLING
		// case "billing_checkout_started":
		// 	return "started a checkout session";
		// case "billing_checkout_success":
		// 	return "completed a subscription purchase";
		// case "billing_checkout_canceled":
		// 	return "canceled a checkout";

		// DEFAULT
		default:
			return "performed an action";
	}
}
