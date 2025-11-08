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
});
