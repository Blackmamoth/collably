import { createContext, useContext, useEffect } from "react";
import { useQuery } from "convex/react";
import { authClient } from "./auth-client";
import type { ActiveOrganization } from "./common/types";
import { api } from "convex/_generated/api";
import { setCurrentWorkspace } from "./common/helper";

const WorkspaceContext = createContext<ActiveOrganization | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
	const { data: activeOrg } = authClient.useActiveOrganization();
	const workspaces = useQuery(api.workspace.getWorkspaces) || [];

	// Automatically set the first workspace as active if there's no active workspace
	useEffect(() => {
		if (activeOrg === null && workspaces.length > 0) {
			setCurrentWorkspace(workspaces[0].id);
		}
	}, [activeOrg, workspaces]);

	return (
		<WorkspaceContext.Provider value={activeOrg ?? null}>
			{children}
		</WorkspaceContext.Provider>
	);
}

export function useWorkspace() {
	return useContext(WorkspaceContext);
}
