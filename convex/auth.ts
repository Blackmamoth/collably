import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { requireActionCtx } from "@convex-dev/better-auth/utils";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { betterAuth } from "better-auth";
import { emailOTP, organization } from "better-auth/plugins";
import authSchema from "./betterAuth/schema";
import { ac, member, owner, viewer } from "./permissions";
import { autumn } from "autumn-js/better-auth";
import { resend } from "./resend";
import { getOtpEmailHtml } from "../src/lib/template/otp-email";
import { getWorkspaceInviteEmailHtml } from "../src/lib/template/workspace-invite";

const siteUrl = process.env.SITE_URL || "";

// The component client has methods needed for integrating Convex with Better Auth,
// as well as helper methods for general use.
export const authComponent = createClient<DataModel, typeof authSchema>(
	components.betterAuth,
	{
		local: {
			schema: authSchema,
		},
	},
);

export const createAuth = (
	ctx: GenericCtx<DataModel>,
	{ optionsOnly } = { optionsOnly: false },
) => {
	return betterAuth({
		appName: "Collably",
		logger: {
			disabled: optionsOnly,
		},
		baseURL: siteUrl,
		database: authComponent.adapter(ctx),
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: true,
			autoSignIn: false,
		},
		session: {
			cookieCache: {
				enabled: true,
			},
		},
		socialProviders: {
			google: {
				clientId: process.env.GOOGLE_CLIENT_ID || "",
				clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
				redirectURI: process.env.GOOGLE_REDIRECT_URI || "",
			},
			github: {
				clientId: process.env.GITHUB_CLIENT_ID || "",
				clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
				redirectURI: process.env.GITHUB_REDIRECT_URI || "",
			},
		},
		emailVerification: {
			autoSignInAfterVerification: true,
		},
		plugins: [
			// The Convex plugin is required for Convex compatibility
			convex(),
			emailOTP({
				overrideDefaultEmailVerification: true,
				sendVerificationOnSignUp: true,
				sendVerificationOTP: async ({ email, otp, type }) => {
					if (type === "email-verification") {
						await resend.sendEmail(requireActionCtx(ctx), {
							to: email,
							from: process.env.RESEND_SENDER_EMAIL || "collably@ashpak.dev",
							subject: "Email verification for your collably account",
							html: getOtpEmailHtml(otp, 10),
						});
					}
				},
			}),
			organization({
				ac,
				roles: {
					owner,
					member,
					viewer,
				},
				sendInvitationEmail: async (data) => {
					// console.log(data);

					const inviteURL = `${siteUrl}/invitation/${data.invitation.id}`;

					await resend.sendEmail(requireActionCtx(ctx), {
						to: data.email,
						from: process.env.RESEND_SENDER_EMAIL || "collably@ashpak.dev",
						subject: "You've been invited to a workspace on collably",
						html: getWorkspaceInviteEmailHtml({
							inviteLink: inviteURL,
							workspaceName: data.organization.name,
							inviterName: data.inviter.user.name,
						}),
					});
				},
				organizationHooks: {
					// beforeCreateInvitation(data) {},
					// afterAcceptInvitation: async (data) => {},
				},
			}),
			autumn({ customerScope: "organization" }),
		],
	});
};
