import { createAccessControl } from "better-auth/plugins/access";

const statement = {
	organization: ["create", "update", "delete"],
	project: ["create", "read", "update", "delete"],
	invitation: ["create", "read", "cancel"],
	member: ["create", "update", "delete"],
	task: ["create", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

export const owner = ac.newRole({
	organization: ["create", "update", "delete"],
	project: ["create", "update", "delete"],
	invitation: ["create", "read", "cancel"],
	member: ["create", "update", "delete"],
	task: ["create", "update", "delete"],
});

export const member = ac.newRole({
	organization: ["create"],
	project: ["create"],
	invitation: ["create", "read"],
	task: ["create", "update", "delete"],
});

export const viewer = ac.newRole({
	project: ["read"],
});
