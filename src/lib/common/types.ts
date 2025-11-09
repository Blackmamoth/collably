import type { Session, User } from "better-auth";
import type { authClient } from "../auth-client";
import type { Member } from "better-auth/plugins";

export interface Workspace {
	id: string;
	name: string;
	slug: string;
	createdAt: Date;
	logo?: string | null | undefined | undefined;
	metadata?: any;
}

export interface Project {
	_id: string;
	_creationTime: number;
	description?: string | undefined;
	workspaceId: string;
	name: string;
	createdBy: string;
	createdAt: number;
	updatedAt: number;
}

// needed because session type doesn't has/infer the field activeOrganizationId
export interface SessionWithOrganizationId extends Session {
	activeOrganizationId?: string;
}

export interface ActiveOrganization
	extends NonNullable<
		ReturnType<typeof authClient.useActiveOrganization>["data"]
	> {}

export interface WorkspaceMember extends Member {
	user: Omit<User, "createdAt" | "updatedAt" | "emailVerified">;
}
