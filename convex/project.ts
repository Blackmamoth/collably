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
	},
	handler: async (ctx, args) => {
		await authComponent.getAuthUser(ctx);
		return await ctx.db
			.query("project")
			.withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
			.order("asc")
			.take(10);
	},
});
