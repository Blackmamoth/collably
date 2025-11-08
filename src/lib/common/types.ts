import type { Session } from "better-auth";

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
