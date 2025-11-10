import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { authComponent, createAuth } from "./auth";

export const getElements = query({
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

		return ctx.db
			.query("element")
			.withIndex("by_project", (q) => q.eq("projectId", projectId))
			.collect();
	},
});

export const insertElement = mutation({
	args: {
		element: v.object({
			projectId: v.id("project"),
			elementType: v.union(
				v.literal("sticky"),
				v.literal("note"),
				v.literal("text"),
				v.literal("rectangle"),
				v.literal("circle"),
				v.literal("arrow"),
				v.literal("line"),
			),
			x: v.number(),
			y: v.number(),
			content: v.optional(v.string()),
			color: v.optional(v.string()),
			width: v.optional(v.number()),
			height: v.optional(v.number()),
			endX: v.optional(v.number()),
			endY: v.optional(v.number()),
			strokeColor: v.optional(v.string()),
			strokeWidth: v.optional(v.number()),
			fillColor: v.optional(v.string()),
			fontSize: v.optional(v.number()),
			fontWeight: v.optional(v.string()),
			groupId: v.optional(v.string()),
			votes: v.number(),
			createdBy: v.string(),
		}),
	},
	handler: async (ctx, { element }) => {
		const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
		const { _id } = await authComponent.getAuthUser(ctx);

		const project = await ctx.db.get(element.projectId);
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

		return await ctx.db.insert("element", {
			...element,
			createdBy: member.id,
			createdAt: Date.now(),
			updatedAt: Date.now(),
		});
	},
});

export const updateElement = mutation({
	args: {
		projectId: v.id("project"),
		id: v.id("element"),
		patch: v.object({
			x: v.optional(v.number()),
			y: v.optional(v.number()),
			content: v.optional(v.string()),
			color: v.optional(v.string()),
			width: v.optional(v.number()),
			height: v.optional(v.number()),
			endX: v.optional(v.number()),
			endY: v.optional(v.number()),
			strokeColor: v.optional(v.string()),
			strokeWidth: v.optional(v.number()),
			fillColor: v.optional(v.string()),
			fontSize: v.optional(v.number()),
			fontWeight: v.optional(v.string()),
			groupId: v.optional(v.string()),
			votes: v.optional(v.number()),
		}),
	},
	handler: async (ctx, { projectId, id, patch }) => {
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
		await ctx.db.patch(id, { ...patch, updatedAt: Date.now() });
	},
});

export const deleteElement = mutation({
	args: { projectId: v.id("project"), id: v.id("element") },
	handler: async (ctx, { id, projectId }) => {
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

		await ctx.db.delete(id);
	},
});
