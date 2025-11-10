import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	project: defineTable({
		workspaceId: v.string(),
		name: v.string(),
		description: v.optional(v.string()),
		createdBy: v.string(),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_workspace", ["workspaceId"])
		.index("by_creator", ["createdBy"]),
	element: defineTable({
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

		// for position
		x: v.number(),
		y: v.number(),

		// notes + shapes
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
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_project", ["projectId"])
		.index("by_creator", ["createdBy"]),
	aiSummary: defineTable({
		projectId: v.id("project"),
		summary: v.string(),
		lastGeneratedAt: v.number(),
	}).index("by_project", ["projectId"]),
	comment: defineTable({
		elementId: v.id("element"),
		userId: v.string(),
		text: v.string(),
		createdAt: v.number(),
	}),
	presence: defineTable({
		projectId: v.id("project"),
		memberId: v.string(),
		lastSeen: v.number(),
		cursorX: v.optional(v.number()),
		cursorY: v.optional(v.number()),
	})
		.index("by_project", ["projectId"])
		.index("by_project_and_member", ["projectId", "memberId"]),
});
