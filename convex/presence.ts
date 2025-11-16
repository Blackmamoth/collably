import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { validateProjectAccess } from "./helpers/authorization";
import { ACTIVE_THRESHOLD } from "./constants";

export const updatePresence = mutation({
	args: {
		projectId: v.id("project"),
		cursorX: v.optional(v.number()),
		cursorY: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const { project, member } = await validateProjectAccess(ctx, args.projectId);

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
		const { project } = await validateProjectAccess(ctx, args.projectId);

		const now = Date.now();
		const cutoffTime = now - ACTIVE_THRESHOLD;

		// Fetch all presence records for the project and filter by active threshold
		// Note: This requires in-memory filtering since there's no time-based index
		const allPresence = await ctx.db
			.query("presence")
			.withIndex("by_project", (q) => q.eq("projectId", project._id))
			.collect();

		const activeMembers = allPresence.filter(
			(p) => p.lastSeen >= cutoffTime,
		);

		return activeMembers;
	},
});

export const removePresence = mutation({
	args: {
		projectId: v.id("project"),
	},
	handler: async (ctx, args) => {
		const { project, member } = await validateProjectAccess(ctx, args.projectId);

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
