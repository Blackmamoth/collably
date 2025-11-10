import { format, formatDistanceToNow } from "date-fns";
import { authClient } from "../auth-client";
import { toast } from "sonner";

export const handleSocialLogin = async (provider: "google" | "github") => {
	await authClient.signIn.social(
		{
			provider,
			callbackURL: "/dashboard",
			newUserCallbackURL: "/onboarding",
		},
		{
			onError: (ctx) => {
				toast.error(ctx.error.message);
			},
		},
	);
};

export const setCurrentWorkspace = async (newWorkspaceId: string) => {
	const { error } = await authClient.organization.setActive({
		organizationId: newWorkspaceId,
	});

	if (error !== null) {
		toast.error(
			error.message || "Something went wrong! Could not switch workspace",
		);
	}
};

export const generateSlug = (input: string): string => {
	return input
		.toLowerCase() // Convert to lowercase
		.trim() // Remove leading/trailing spaces
		.replace(/[^a-z0-9\s-]/g, "") // Remove any characters that are not letters, numbers, or spaces
		.replace(/\s+/g, "-") // Replace spaces with hyphens
		.replace(/-+/g, "-") // Replace multiple hyphens with a single one
		.replace(/^-|-$/g, ""); // Remove hyphens from the start or end of the string
};

export const formatDateSince = (date: Date) => {
	return format(date, "MMM yyyy");
};

export const formatExpiresIn = (date: Date) => {
	return `Expires ${formatDistanceToNow(date, { addSuffix: true })}`;
};

// Helper function to generate consistent colors from member IDs
export const generateColorFromId = (id: string): string => {
	const colors = [
		"#3b82f6", // blue
		"#10b981", // green
		"#f59e0b", // amber
		"#ef4444", // red
		"#8b5cf6", // violet
		"#ec4899", // pink
		"#06b6d4", // cyan
		"#f97316", // orange
	];

	// Simple hash function
	let hash = 0;
	for (let i = 0; i < id.length; i++) {
		hash = id.charCodeAt(i) + ((hash << 5) - hash);
	}

	return colors[Math.abs(hash) % colors.length];
};
