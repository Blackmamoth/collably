import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent, createAuth } from "./auth";

export const createProject = mutation({
	args: {
		workspaceId: v.string(),
		name: v.string(),
		description: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		const projectId = await ctx.db.insert("project", {
			name: args.name,
			workspaceId: args.workspaceId,
			description: args.description,
			createdBy: user._id,
			createdAt: Date.now(),
			updatedAt: Date.now(),
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
		const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
		const { _id } = await authComponent.getAuthUser(ctx);

		const project = await ctx.db.get(projectId);
		if (project === null) {
			throw new Error("project not found");
		}

		const member = await auth.api.getActiveMember({ headers: headers });

		if (member === null || member.user.id !== _id) {
			throw new Error("you cannot access this project");
		}

		if (member.organizationId !== project.workspaceId) {
			throw new Error("you cannot access this project");
		}

		return project;
	},
});
