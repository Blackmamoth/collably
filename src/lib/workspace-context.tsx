import { createContext, useContext } from "react";
import { authClient } from "./auth-client";
import type { ActiveOrganization } from "./common/types";

const WorkspaceContext = createContext<ActiveOrganization | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
	const { data: activeOrg } = authClient.useActiveOrganization();

	return (
		<WorkspaceContext value={activeOrg ?? null}>{children}</WorkspaceContext>
	);
}

export function useWorkspace() {
	return useContext(WorkspaceContext);
}
