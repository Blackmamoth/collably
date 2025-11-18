import { createFileRoute } from "@tanstack/react-router";
import { reactStartHandler } from "@convex-dev/better-auth/react-start";

export const Route = createFileRoute("/api/auth/$")({
	server: {
		handlers: {
			GET: ({ request }) => {
				// Clone the request to avoid body stream conflicts
				const clonedRequest = request.clone();
				return reactStartHandler(clonedRequest);
			},
			POST: ({ request }) => {
				// Clone the request to avoid body stream conflicts
				const clonedRequest = request.clone();
				return reactStartHandler(clonedRequest);
			},
		},
	},
});

