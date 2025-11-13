import {
	action,
	internalMutation,
	internalQuery,
	mutation,
	query,
} from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { authComponent, createAuth } from "./auth";
import { generateObject } from "ai";
import * as z from "zod";
import {
	SUBTASK_GENERATOR_SYSTEM_PROMPT,
	SUBTASK_GENERATOR_USER_PROMPT,
	TAG_GENERATOR_SYSTEM_PROMPT,
	TAG_GENERATOR_USER_PROMPT,
} from "./prompts";
import { model } from "./ai";
import { internal } from "./_generated/api";
import type { Id, Doc } from "./_generated/dataModel";

export const createTask = action({
	args: {
		projectId: v.id("project"),
		parentTaskId: v.optional(v.id("task")),
		title: v.string(),
		description: v.optional(v.string()),
		assignee: v.string(),
		priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
		dueDate: v.optional(v.number()),
		createdBy: v.string(),
	},
	handler: async (ctx, args) => {
		let tags: string[] = [];

		try {
			const { object } = await generateObject({
				model,
				schema: z.object({
					tags: z.array(z.string().trim()).describe("tags for the given task"),
				}),
				system: TAG_GENERATOR_SYSTEM_PROMPT,
				prompt: TAG_GENERATOR_USER_PROMPT.replace(
					"{TASK_TITLE}",
					args.title,
				).replace(
					"{OPTIONAL_DESCRIPTION}",
					args.description ? args.description : "No description",
				),
			});

			tags = object.tags;
		} catch (error) {
			console.error(error);
			tags = [];
		}

		const taskId: Id<"task"> = await ctx.runMutation(internal.task.saveTask, {
			...args,
			tags,
		});

		return taskId;
	},
});

export const saveTask = internalMutation({
	args: {
		projectId: v.id("project"),
		parentTaskId: v.optional(v.id("task")),
		title: v.string(),
		description: v.optional(v.string()),
		assignee: v.string(),
		priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
		dueDate: v.optional(v.number()),
		tags: v.array(v.string()),
		createdBy: v.string(),
		status: v.optional(
			v.union(v.literal("todo"), v.literal("inprogress"), v.literal("done")),
		),
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

		return await ctx.db.insert("task", {
			projectId: args.projectId,
			parentTaskId: args.parentTaskId,
			title: args.title,
			description: args.description,
			assignee: args.assignee,
			createdBy: args.createdBy,
			priority: args.priority,
			status: args.status ? args.status : "todo",
			tags: args.tags,
			dueDate: args.dueDate,
			createdAt: now,
			updatedAt: now,
		});
	},
});

export const generateSubTasks = action({
	args: { taskId: v.id("task") },
	handler: async (ctx, args) => {
		const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

		const data = await auth.api.check({
			headers,
			body: {
				featureId: "ai_summaries_and_subtask_generation",
			},
		});

		if (!data.allowed) {
			throw new ConvexError(
				"You have reached the maximum number of AI credits available for your account.",
			);
		}

		const task = await ctx.runQuery(internal.task.getTaskById, {
			taskId: args.taskId,
		});

		if (!task) {
			throw new Error("task not found");
		}

		let newSubtaskTitles: string[] = [];

		try {
			const { object } = await generateObject({
				model,
				schema: z.object({
					subTasks: z
						.array(
							z
								.string()
								.trim()
								.max(120, "Task title must be under 120 characters"),
						)
						.describe("titles for the new subtasks"),
				}),
				system: SUBTASK_GENERATOR_SYSTEM_PROMPT,
				prompt: SUBTASK_GENERATOR_USER_PROMPT.replace(
					"{TASK_TITLE}",
					task.title,
				).replace(
					"{OPTIONAL_DESCRIPTION}",
					task.description ? task.description : "No description",
				),
			});

			newSubtaskTitles = object.subTasks;
		} catch (error) {
			console.error(error);
			newSubtaskTitles = [];
		}

		for (const subtask of newSubtaskTitles) {
			await ctx.runMutation(internal.task.saveTask, {
				projectId: task.projectId,
				parentTaskId: task._id,
				title: subtask,
				description: undefined,
				assignee: task.assignee,
				createdBy: task.createdBy,
				priority: task.priority,
				status: task.status,
				tags: [],
				dueDate: undefined,
			});
		}

		await auth.api.track({
			body: { featureId: "ai_summaries_and_subtask_generation", value: 1 },
			headers: headers,
		});
	},
});

export const getTaskById = internalQuery({
	args: { taskId: v.id("task") },
	handler: async (ctx, args) => {
		const task = await ctx.db.get(args.taskId);
		return task;
	},
});

interface TaskWithSubtasks extends Doc<"task"> {
	subTasks: Doc<"task">[];
}

interface GroupedTasks {
	title: string;
	status: "todo" | "inprogress" | "done";
	tasks: TaskWithSubtasks[];
}

export const getTasks = query({
	args: { projectId: v.id("project") },
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

		const tasks = await ctx.db
			.query("task")
			.withIndex("by_project", (q) => q.eq("projectId", args.projectId))
			.collect();

		return groupTasks(tasks);
	},
});

const groupTasks = (tasks: Doc<"task">[]): GroupedTasks[] => {
	const taskMap = new Map<string, TaskWithSubtasks>();
	for (const task of tasks) {
		taskMap.set(task._id, { ...task, subTasks: [] });
	}

	const topLevelTasks: TaskWithSubtasks[] = [];

	for (const task of taskMap.values()) {
		if (task.parentTaskId && taskMap.has(task.parentTaskId)) {
			const t = taskMap.get(task.parentTaskId);
			if (t) {
				t.subTasks.push(task);
			}
		} else {
			topLevelTasks.push(task);
		}
	}

	const groupByStatus: { [key: string]: TaskWithSubtasks[] } = {
		todo: [],
		inprogress: [],
		done: [],
	};

	for (const task of topLevelTasks) {
		groupByStatus[task.status].push(task);
	}

	const grouped: GroupedTasks[] = [
		{ title: "To Do", status: "todo", tasks: groupByStatus.todo },
		{
			title: "In Progress",
			status: "inprogress",
			tasks: groupByStatus.inprogress,
		},
		{ title: "Done", status: "done", tasks: groupByStatus.done },
	];

	return grouped;
};

export const updateTaskStatus = mutation({
	args: {
		taskId: v.id("task"),
		projectId: v.id("project"),
		newStatus: v.union(
			v.literal("todo"),
			v.literal("inprogress"),
			v.literal("done"),
		),
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

		const task = await ctx.db.get(args.taskId);
		if (!task) {
			throw new Error("task not found");
		}

		if (args.newStatus === "done") {
			const subTasks = await ctx.db
				.query("task")
				.withIndex("by_parent", (q) => q.eq("parentTaskId", task._id))
				.collect();

			if (subTasks?.length) {
				const areAllSubTasksDone = subTasks.every((st) => st.status === "done");
				if (areAllSubTasksDone === false) {
					throw new ConvexError(
						"you need to complete all the sub tasks before you can mark the main task as done",
					);
				}
			}
		}

		await ctx.db.patch(args.taskId, { status: args.newStatus });
	},
});

export const removeTask = mutation({
	args: { projectId: v.id("project"), taskId: v.id("task") },
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

		const task = await ctx.db.get(args.taskId);
		if (!task) {
			throw new Error("task not found");
		}

		if (member.id !== task.assignee && member.role !== "owner") {
			throw new Error("you are not the assignee of this task");
		}

		await ctx.db.delete(task._id);
	},
});
