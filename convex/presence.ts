import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent, createAuth } from "./auth";

export const updatePresence = mutation({
	args: {
		projectId: v.id("project"),
		cursorX: v.optional(v.number()),
		cursorY: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
		const { _id } = await authComponent.getAuthUser(ctx);

		const project = await ctx.db.get(args.projectId);
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

		const now = Date.now();

		const existing = await ctx.db
			.query("presence")
			.withIndex("by_project_and_member", (q) =>
				q.eq("projectId", project._id).eq("memberId", member.id),
			)
			.first();

		if (existing) {
			await ctx.db.patch(existing._id, {
				lastSeen: now,
				cursorX: args.cursorX,
				cursorY: args.cursorY,
				updatedAt: now,
			});
		} else {
			const now = Date.now();
			await ctx.db.insert("presence", {
				projectId: project._id,
				memberId: member.id,
				lastSeen: now,
				cursorX: args.cursorX,
				cursorY: args.cursorY,
				createdAt: now,
				updatedAt: now,
			});
		}
	},
});

export const getActiveMembers = query({
	args: {
		projectId: v.id("project"),
	},
	handler: async (ctx, args) => {
		const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
		const { _id } = await authComponent.getAuthUser(ctx);

		const project = await ctx.db.get(args.projectId);
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

		const now = Date.now();
		const ACTIVE_THRESHOLD = 30000;

		const allPresence = await ctx.db
			.query("presence")
			.withIndex("by_project", (q) => q.eq("projectId", project._id))
			.collect();

		const activeMembers = allPresence.filter(
			(p) => now - p.lastSeen < ACTIVE_THRESHOLD,
		);

		return activeMembers;
	},
});

export const removePresence = mutation({
	args: {
		projectId: v.id("project"),
	},
	handler: async (ctx, args) => {
		const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
		const { _id } = await authComponent.getAuthUser(ctx);

		const project = await ctx.db.get(args.projectId);
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

		const existing = await ctx.db
			.query("presence")
			.withIndex("by_project_and_member", (q) =>
				q.eq("projectId", project._id).eq("memberId", member.id),
			)
			.first();

		if (existing) {
			await ctx.db.delete(existing._id);
		}
	},
});
