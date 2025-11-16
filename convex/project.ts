import { ConvexError, v } from "convex/values";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { action, internalMutation, mutation, query } from "./_generated/server";
import { authComponent, createAuth } from "./auth";
import { validateProjectAccess } from "./helpers/authorization";

export const createProject = action({
	args: {
		workspaceId: v.string(),
		name: v.string(),
		description: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

		const user = await authComponent.getAuthUser(ctx);

		const data = await auth.api.check({
			headers: headers,
			body: {
				featureId: "projects",
			},
		});

		if (!data.allowed) {
			throw new ConvexError(
				"You have reached the maximum number of projects you can create.",
			);
		}

		const projectId: Id<"project"> = await ctx.runMutation(
			internal.project.createNewProject,
			{
				...args,
				userId: user._id,
			},
		);

		await auth.api.track({
			headers: headers,
			body: {
				featureId: "projects",
				value: 1,
			},
		});

		return projectId;
	},
});

export const createNewProject = internalMutation({
	args: {
		workspaceId: v.string(),
		name: v.string(),
		userId: v.string(),
		description: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const projectId = await ctx.db.insert("project", {
			name: args.name,
			workspaceId: args.workspaceId,
			description: args.description,
			createdBy: args.userId,
			createdAt: Date.now(),
			updatedAt: Date.now(),
		});

		await ctx.db.insert("activityLog", {
			action: "project_created",
			memberId: args.userId,
			projectId: projectId,
			workspaceId: args.workspaceId,
		});

		return projectId;
	},
});

export const getProjects = query({
	args: {
		workspaceId: v.string(),
		limit: v.optional(v.number()),
		sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
	},
	handler: async (ctx, { workspaceId, limit, sortOrder }) => {
		await authComponent.getAuthUser(ctx);
		return await ctx.db
			.query("project")
			.withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
			.order(sortOrder ?? "asc")
			.take(limit ?? 10);
	},
});

export const getProject = query({
	args: { projectId: v.id("project") },
	handler: async (ctx, { projectId }) => {
		const { project } = await validateProjectAccess(ctx, projectId);
		return project;
	},
});

export const updateProject = mutation({
	args: {
		projectId: v.id("project"),
		name: v.string(),
		description: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { member } = await validateProjectAccess(ctx, args.projectId);

		if (member.role !== "owner") {
			throw new ConvexError(
				"only the owner of the workspace can update project details",
			);
		}

		const now = Date.now();
		await ctx.db.patch(args.projectId, {
			name: args.name,
			description: args.description,
			updatedAt: now,
		});

		await ctx.db.insert("activityLog", {
			action: "project_updated",
			memberId: member.id,
			projectId: args.projectId,
			workspaceId: member.organizationId,
		});
	},
});

export const getProjectStats = query({
	args: { projectId: v.id("project") },
	handler: async (ctx, { projectId }) => {
		await validateProjectAccess(ctx, projectId);

		// Use indexed queries to fetch tasks by status directly
		const [allTasks, completedTasks, todoTasks, inprogressTasks, notes] =
			await Promise.all([
				ctx.db
					.query("task")
					.withIndex("by_project", (q) => q.eq("projectId", projectId))
					.collect(),
				ctx.db
					.query("task")
					.withIndex("by_project_and_status", (q) =>
						q.eq("projectId", projectId).eq("status", "done"),
					)
					.collect(),
				ctx.db
					.query("task")
					.withIndex("by_project_and_status", (q) =>
						q.eq("projectId", projectId).eq("status", "todo"),
					)
					.collect(),
				ctx.db
					.query("task")
					.withIndex("by_project_and_status", (q) =>
						q.eq("projectId", projectId).eq("status", "inprogress"),
					)
					.collect(),
				ctx.db
					.query("element")
					.withIndex("by_project_and_type", (q) =>
						q.eq("projectId", projectId).eq("elementType", "note"),
					)
					.collect(),
			]);

		const pendingTasks = [...todoTasks, ...inprogressTasks];

		return {
			total_tasks: allTasks.length,
			total_completed_tasks: completedTasks.length,
			total_pending_tasks: pendingTasks.length,
			total_notes: notes.length,
		};
	},
});

export const deleteProject = action({
	args: { projectId: v.id("project") },
	handler: async (ctx, { projectId }) => {
		const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
		const { _id } = await authComponent.getAuthUser(ctx);

		await ctx.runQuery(api.project.getProject, { projectId });
		const member = await auth.api.getActiveMember({ headers: headers });

		if (!member) {
			throw new ConvexError("you are not authorized to delete this project");
		}

		if (member.role !== "owner") {
			throw new ConvexError(
				"only the owner of the workspace can delete the project",
			);
		}

		await ctx.runMutation(internal.project.deleteProjectFromDB, {
			workspaceId: member.organizationId,
			projectId,
			memberId: member.id,
		});

		await auth.api.track({
			body: { featureId: "projects", value: -1 },
			headers,
		});
	},
});

export const deleteProjectFromDB = internalMutation({
	args: {
		workspaceId: v.string(),
		projectId: v.id("project"),
		memberId: v.string(),
	},
	handler: async (ctx, { workspaceId, projectId, memberId }) => {
		await ctx.db.delete(projectId);

		await ctx.db.insert("activityLog", {
			action: "project_deleted",
			memberId: memberId,
			projectId: projectId,
			workspaceId: workspaceId,
		});
	},
});
