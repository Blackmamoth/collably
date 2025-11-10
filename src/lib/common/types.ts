import type { User } from "better-auth";
import type { authClient } from "../auth-client";
import type { Member } from "better-auth/plugins";
import type { Id } from "convex/_generated/dataModel";

export interface Workspace {
	id: string;
	name: string;
	slug: string;
	createdAt: Date;
	logo?: string | null | undefined | undefined;
	// metadata?: any;
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

export interface ActiveMember {
	_id: Id<"presence">;
	_creationTime: number;
	cursorX?: number | undefined;
	cursorY?: number | undefined;
	projectId: Id<"project">;
	memberId: string;
	lastSeen: number;
}

// // needed because session type doesn't has/infer the field activeOrganizationId
// export interface SessionWithOrganizationId extends Session {
// 	activeOrganizationId?: string;
// }

export interface ActiveOrganization
	extends NonNullable<
		ReturnType<typeof authClient.useActiveOrganization>["data"]
	> {}

export interface WorkspaceMember extends Member {
	user: Omit<User, "createdAt" | "updatedAt" | "emailVerified">;
}

export interface BoardElement {
	_id: Id<"element">;
	_creationTime: number;
	content?: string | undefined;
	color?: string | undefined;
	width?: number | undefined;
	height?: number | undefined;
	endX?: number | undefined;
	endY?: number | undefined;
	strokeColor?: string | undefined;
	strokeWidth?: number | undefined;
	fillColor?: string | undefined;
	fontSize?: number | undefined;
	fontWeight?: string | undefined;
	groupId?: string | undefined;
	votes?: number | undefined;
	createdBy: string;
	createdAt: number;
	updatedAt: number;
	projectId: Id<"project">;
	elementType:
		| "sticky"
		| "note"
		| "text"
		| "rectangle"
		| "circle"
		| "arrow"
		| "line";
	x: number;
	y: number;
}

export type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

export type ElementType =
	| "sticky"
	| "note"
	| "text"
	| "rectangle"
	| "circle"
	| "arrow"
	| "line";

export interface BaseElement {
	id: number;
	type: ElementType;
	position: { x: number; y: number };
	author: string;
	timestamp: string;
	groupId?: string; // Added groupId for template grouping
}

export interface StickyNoteElement extends BaseElement {
	type: "note" | "sticky"; // Allow both 'note' and 'sticky' for backward compatibility or flexibility
	content: string;
	color: string;
	size: { width: number; height: number };
	votes: number;
	comments: Comment[];
}

export interface TextElement extends BaseElement {
	type: "text";
	content: string;
	fontSize: number;
	fontWeight: "normal" | "bold";
	color: string;
}

export interface ShapeElement extends BaseElement {
	type: "rectangle" | "circle";
	size: { width: number; height: number };
	fillColor: string;
	strokeColor: string;
	strokeWidth: number;
}

export interface ConnectorElement extends BaseElement {
	type: "arrow" | "line";
	endPosition: { x: number; y: number };
	strokeColor: string;
	strokeWidth: number;
}

export type CanvasElement =
	| StickyNoteElement
	| TextElement
	| ShapeElement
	| ConnectorElement;

export interface Comment {
	id: number;
	author: string;
	content: string;
	timestamp: string;
}

export interface LiveCursor {
	id: string;
	name: string;
	color: string;
	position: { x: number; y: number };
}
