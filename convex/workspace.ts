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

