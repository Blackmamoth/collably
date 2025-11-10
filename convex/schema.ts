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
		content: v.optional(v.string()),
		x: v.number(),
		y: v.number(),
		color: v.optional(v.string()),
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
