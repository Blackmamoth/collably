import { createAccessControl } from "better-auth/plugins/access";

const statement = {
	project: ["create", "read", "update", "delete"],
	invitation: ["create", "read", "cancel"],
	member: ["create", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

export const owner = ac.newRole({
	project: ["create", "update", "delete"],
	invitation: ["create", "read", "cancel"],
	member: ["create", "update", "delete"],
});

export const member = ac.newRole({
	project: ["create"],
	invitation: ["create", "read"],
});

export const viewer = ac.newRole({
	project: ["read"],
});
