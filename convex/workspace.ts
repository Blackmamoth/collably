import { ConvexError } from "convex/values";
import { query } from "./_generated/server";
import { authComponent, createAuth } from "./auth";
import { mutation } from "./betterAuth/_generated/server";

export const getWorkspaces = query({
	args: {},
	handler: async (ctx, args) => {
		const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
		const workspaces = await auth.api.listOrganizations({ headers: headers });
		return workspaces;
	},
});

export const getWorkspaceMembers = query({
	args: {},
	handler: async (ctx, args) => {
		const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
		const workspaceMembers = await auth.api.listMembers({ headers: headers });
		return workspaceMembers;
	},
});

export const getWorkspaceInvitations = query({
	args: {},
	handler: async (ctx, args) => {
		const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
		const workspaceInvitations = await auth.api.listInvitations({
			headers: headers,
		});
		return workspaceInvitations;
	},
});

export const deleteWorkspace = mutation({
	args: {},
	handler: async (ctx, args) => {
		const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

		const member = await auth.api.getActiveMember({ headers });
		if (!member) {
			throw new ConvexError(
				"you do not belong to the workspace you want to delete",
			);
		}

		if (member.role !== "owner") {
			throw new ConvexError(
				"you must be the owner of the workspace to delete it",
			);
		}

		await auth.api.deleteOrganization({
			headers,
			body: { organizationId: member.organizationId },
		});
	},
});
