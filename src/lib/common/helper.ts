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

export const generateSlug = (input: string): string => {
	return input
		.toLowerCase() // Convert to lowercase
		.trim() // Remove leading/trailing spaces
		.replace(/[^a-z0-9\s-]/g, "") // Remove any characters that are not letters, numbers, or spaces
		.replace(/\s+/g, "-") // Replace spaces with hyphens
		.replace(/-+/g, "-") // Replace multiple hyphens with a single one
		.replace(/^-|-$/g, ""); // Remove hyphens from the start or end of the string
};
