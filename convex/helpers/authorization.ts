import type { User } from "better-auth";
import type { Member } from "better-auth/plugins";
import type { GenericMutationCtx, GenericQueryCtx } from "convex/server";
import { ConvexError } from "convex/values";
import type { DataModel, Doc, Id } from "../_generated/dataModel";
import { authComponent, createAuth } from "../auth";

type ProjectContext = GenericQueryCtx<DataModel> | GenericMutationCtx<DataModel>;

export interface WorkspaceMember extends Member {
	user: Omit<User, "createdAt" | "updatedAt" | "emailVerified">;
}

interface ProjectAccessResult {
	project: Doc<"project">;
	member: WorkspaceMember;
}


export async function validateProjectAccess(
	ctx: ProjectContext,
	projectId: Id<"project">,
): Promise<ProjectAccessResult> {
	const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
	const { _id } = await authComponent.getAuthUser(ctx);

	const project = await ctx.db.get(projectId);
	if (project === null) {
		throw new ConvexError("project not found");
	}

	const member = await auth.api.getActiveMember({ headers: headers });

	if (member === null || member.user.id !== _id) {
		throw new ConvexError("you cannot access this project");
	}

	if (member.organizationId !== project.workspaceId) {
		throw new ConvexError("you cannot access this project");
	}

	return { project, member };
}

