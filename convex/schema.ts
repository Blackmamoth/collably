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
		.index("by_project_and_type", ["projectId", "elementType"])
		.index("by_creator", ["createdBy"]),
	aiSummary: defineTable({
		projectId: v.id("project"),
		summary: v.string(),
		lastGeneratedAt: v.number(),
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("by_project", ["projectId"]),
	comment: defineTable({
		elementId: v.id("element"),
		memberId: v.string(),
		memberName: v.string(),
		text: v.string(),
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("by_element", ["elementId"]),
	presence: defineTable({
		projectId: v.id("project"),
		memberId: v.string(),
		lastSeen: v.number(),
		cursorX: v.optional(v.number()),
		cursorY: v.optional(v.number()),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_project", ["projectId"])
		.index("by_project_and_member", ["projectId", "memberId"]),
	task: defineTable({
		projectId: v.id("project"),
		parentTaskId: v.optional(v.id("task")),
		title: v.string(),
		description: v.optional(v.string()),
		assignee: v.string(),
		status: v.union(
			v.literal("todo"),
			v.literal("inprogress"),
			v.literal("done"),
		),
		priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
		dueDate: v.optional(v.number()),
		tags: v.array(v.string()),
		createdBy: v.string(),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_project", ["projectId"])
		.index("by_creator", ["createdBy"])
		.index("by_parent", ["parentTaskId"])
		.index("by_status", ["status"])
		.index("by_project_and_status", ["projectId", "status"]),
	activityLog: defineTable({
		workspaceId: v.string(),
		projectId: v.id("project"),
		taskId: v.optional(v.id("task")),
		elementId: v.optional(v.id("element")),

		memberId: v.string(),

		action: v.union(
			// workspace
			v.literal("workspace_created"),
			v.literal("workspace_updated"),
			v.literal("workspace_deleted"),
			v.literal("workspace_plan_updated"),
			v.literal("workspace_member_invited"),
			v.literal("workspace_member_removed"),
			v.literal("workspace_member_role_changed"),

			// project
			v.literal("project_created"),
			v.literal("project_updated"),
			v.literal("project_deleted"),

			// task
			v.literal("task_created"),
			v.literal("task_updated"),
			v.literal("task_deleted"),
			v.literal("task_moved"),
			v.literal("task_completed"),
			v.literal("task_reopened"),
			// v.literal("task_subtask_added"),
			// v.literal("task_subtask_completed"),

			// element
			v.literal("element_created"),

			// comments
			v.literal("comment_added"),

			// billing not for now
			// v.literal("billing_checkout_started"),
			// v.literal("billing_checkout_success"),
			// v.literal("billing_checkout_canceled"),
		),
	})
		.index("by_workspace", ["workspaceId"])
		.index("by_project", ["projectId"])
		.index("by_task", ["taskId"])
		.index("by_element", ["elementId"])
		.index("by_member", ["memberId"]),
});
