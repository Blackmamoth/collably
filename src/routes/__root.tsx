import {
	HeadContent,
	Scripts,
	createRootRouteWithContext,
	useRouteContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { ThemeProvider } from "next-themes";
import { createServerFn } from "@tanstack/react-start";
import type { QueryClient } from "@tanstack/react-query";
import type { ConvexQueryClient } from "@convex-dev/react-query";
import type { ConvexReactClient } from "convex/react";
import { getCookie, getRequest } from "@tanstack/react-start/server";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import {
	fetchSession,
	getCookieName,
} from "@convex-dev/better-auth/react-start";
import { authClient } from "@/lib/auth-client";
import { AutumnProvider } from "autumn-js/react";

// Import Geist fonts
import "@fontsource/geist-sans/400.css";
import "@fontsource/geist-sans/500.css";
import "@fontsource/geist-sans/600.css";
import "@fontsource/geist-sans/700.css";
import "@fontsource/geist-mono/400.css";
import "@fontsource/geist-mono/500.css";
import "@fontsource/geist-mono/600.css";
import "@fontsource/geist-mono/700.css";

// Import your globals.css (copy from Taskloom project)
import appCss from "../styles.css?url";
import NotFound from "@/components/not-found";
import { Toaster } from "@/components/ui/sonner";
import { WorkspaceProvider } from "@/lib/workspace-context";

const fetchAuth = createServerFn({ method: "GET" }).handler(async () => {
	try {
		const { createAuth } = await import("../../convex/auth");
		const { session } = await fetchSession(getRequest());
		const sessionCookieName = getCookieName(createAuth);
		const token = getCookie(sessionCookieName);
		return {
			user: session?.user,
			session: session?.session,
			token,
		};
	} catch (error) {
		console.error(error);
		return { user: undefined, session: undefined };
	}
});

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
	convexClient: ConvexReactClient;
	convexQueryClient: ConvexQueryClient;
}>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Taskloom - Transform Team Collaboration",
			},
			{
				name: "description",
				content:
					"Real-time collaboration platform with Decision Boards and Task Boards. Brainstorm, plan, and execute with your team.",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	beforeLoad: async (ctx) => {
		const { user, session, token } = await fetchAuth();

		if (token) {
			ctx.context.convexQueryClient.serverHttpClient?.setAuth(token);
		}

		return { user, session };
	},

	shellComponent: RootDocument,

	notFoundComponent: NotFound,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	const context = useRouteContext({ from: Route.id });
	return (
		<html lang="en" className="dark" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body className="font-sans antialiased">
				<ConvexBetterAuthProvider
					client={context.convexClient}
					authClient={authClient}
				>
					<AutumnProvider betterAuthUrl={import.meta.env.VITE_BETTER_AUTH_URL}>
						<WorkspaceProvider>
							<ThemeProvider
								attribute="class"
								defaultTheme="dark"
								enableSystem
								disableTransitionOnChange
							>
								{children}
								<TanStackDevtools
									config={{
										position: "bottom-right",
									}}
									plugins={[
										{
											name: "Tanstack Router",
											render: <TanStackRouterDevtoolsPanel />,
										},
									]}
								/>
								<Toaster
									position="bottom-right"
									expand={false}
									richColors
									closeButton
									duration={4000}
								/>
							</ThemeProvider>
						</WorkspaceProvider>
					</AutumnProvider>
				</ConvexBetterAuthProvider>
				<Scripts />
			</body>
		</html>
	);
}
