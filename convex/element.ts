import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { validateProjectAccess } from "./helpers/authorization";

export const getElements = query({
	args: { projectId: v.id("project") },
	handler: async (ctx, { projectId }) => {
		const {  member } = await validateProjectAccess(ctx, projectId);

		const elements = await ctx.db
			.query("element")
			.withIndex("by_project", (q) => q.eq("projectId", projectId))
			.collect();

		// Batch fetch all comments and votes to avoid N+1 queries
		const elementIds = elements.map((e) => e._id);

		// Fetch all comments for all elements in parallel
		const allComments = await Promise.all(
			elementIds.map((elementId) =>
				ctx.db
					.query("comment")
					.withIndex("by_element", (q) => q.eq("elementId", elementId))
					.collect(),
			),
		);

		// Fetch all votes for current member in parallel
		const allVotes = await Promise.all(
			elementIds.map((elementId) =>
				ctx.db
					.query("elementVote")
					.withIndex("by_element_and_member", (q) =>
						q.eq("elementId", elementId).eq("memberId", member.id),
					)
					.first(),
			),
		);

		// Build maps for quick lookup
		const commentCountMap = new Map<Id<"element">, number>();
		elementIds.forEach((elementId, index) => {
			commentCountMap.set(elementId, allComments[index].length);
		});

		const voteMap = new Map<Id<"element">, boolean>();
		elementIds.forEach((elementId, index) => {
			voteMap.set(elementId, allVotes[index] !== null);
		});

		// Map elements with comment counts and vote status
		const elementsWithComments = elements.map((element) => ({
			...element,
			commentCount: commentCountMap.get(element._id) ?? 0,
			hasVoted: voteMap.get(element._id) ?? false,
		}));

		return elementsWithComments;
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
		const { project, member } = await validateProjectAccess(ctx, element.projectId);

		const elementId = await ctx.db.insert("element", {
			...element,
			createdBy: member.id,
			createdAt: Date.now(),
			updatedAt: Date.now(),
		});

		if (element.elementType === "note") {
			await ctx.db.insert("activityLog", {
				action: "element_created",
				memberId: member.id,
				projectId: project._id,
				workspaceId: member.organizationId,
				elementId: elementId,
			});
		}

		return elementId;
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
		await validateProjectAccess(ctx, projectId);
		await ctx.db.patch(id, { ...patch, updatedAt: Date.now() });
	},
});

export const deleteElement = mutation({
	args: { projectId: v.id("project"), id: v.id("element") },
	handler: async (ctx, { id, projectId }) => {
		const { member } = await validateProjectAccess(ctx, projectId);

		const element = await ctx.db.get(id);

		if (!element) {
			throw new ConvexError("element not found");
		}

		if (element.createdBy !== member.id) {
			throw new ConvexError("you did not create this element");
		}

		await ctx.db.delete(id);
	},
});

export const addComment = mutation({
	args: { projectId: v.id("project"), id: v.id("element"), text: v.string() },
	handler: async (ctx, { id, projectId, text }) => {
		const { member } = await validateProjectAccess(ctx, projectId);

		const element = await ctx.db.get(id);

		if (!element) {
			throw new ConvexError("element not found");
		}

		const now = Date.now();

		await ctx.db.insert("comment", {
			elementId: id,
			text: text,
			memberId: member.id,
			memberName: member.user.name,
			createdAt: now,
			updatedAt: now,
		});
	},
});

export const getComments = query({
	args: { id: v.id("element"), projectId: v.id("project") },
	handler: async (ctx, { id, projectId }) => {
		await validateProjectAccess(ctx, projectId);

		return await ctx.db
			.query("comment")
			.withIndex("by_element", (q) => q.eq("elementId", id))
			.collect();
	},
});

export const toggleVote = mutation({
	args: { projectId: v.id("project"), id: v.id("element") },
	handler: async (ctx, { id, projectId }) => {
		const { member } = await validateProjectAccess(ctx, projectId);

		const element = await ctx.db.get(id);

		if (!element) {
			throw new ConvexError("element not found");
		}

		// Only allow voting on notes and sticky notes
		if (element.elementType !== "note" && element.elementType !== "sticky") {
			throw new ConvexError("voting is only allowed on notes and sticky notes");
		}

		// Check if member has already voted
		const existingVote = await ctx.db
			.query("elementVote")
			.withIndex("by_element_and_member", (q) =>
				q.eq("elementId", id).eq("memberId", member.id),
			)
			.first();

		if (existingVote) {
			// Remove vote: delete the vote record and decrement count
			await ctx.db.delete(existingVote._id);
			const newVoteCount = Math.max(0, element.votes - 1);
			await ctx.db.patch(id, {
				votes: newVoteCount,
				updatedAt: Date.now(),
			});
			return newVoteCount;
		} else {
			// Add vote: create vote record and increment count
			await ctx.db.insert("elementVote", {
				elementId: id,
				memberId: member.id,
				createdAt: Date.now(),
			});
			const newVoteCount = element.votes + 1;
			await ctx.db.patch(id, {
				votes: newVoteCount,
				updatedAt: Date.now(),
			});
			return newVoteCount;
		}
	},
});
