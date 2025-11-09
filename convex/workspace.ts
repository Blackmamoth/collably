import { query } from "./_generated/server";
import { authComponent, createAuth } from "./auth";

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
