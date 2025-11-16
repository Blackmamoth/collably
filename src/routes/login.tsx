import { useForm } from "@tanstack/react-form";
import {
	createFileRoute,
	Link,
	redirect,
	useNavigate,
} from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";
import { Logo } from "@/components/landing/logo";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

const loginSchema = z.object({
	email: z.email({ message: "please provide a valid email address" }),
	password: z
		.string()
		.min(8, "password should have minimum of 8 characters")
		.max(16, "password should have maximum of 16 characters"),
});

export const Route = createFileRoute("/login")({
	component: LoginComponent,
	beforeLoad: ({ context }) => {
		const { user } = context;

		if (user !== undefined) {
			throw redirect({ to: "/dashboard" });
		}
	},
});

function LoginComponent() {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			setIsLoading(true);
			try {
				await authClient.signIn.email(
					{
						email: value.email,
						password: value.password,
						callbackURL: "/dashboard",
					},
					{
						onError: async (ctx) => {
							if (ctx.error.message === "Email not verified") {
								const { error } =
									await authClient.emailOtp.sendVerificationOtp({
										email: value.email,
										type: "email-verification",
									});
								if (error !== null) {
									toast.error(
										error.message ||
											"An error occurred while sending verification code, please try again!",
									);
									return;
								}

								navigate({
									to: "/email/verify-otp",
									search: { email: value.email },
								});
							} else {
								toast.error(
									ctx.error.message || "Failed to sign in. Please try again.",
								);
							}
						},
					},
				);
			} finally {
				setIsLoading(false);
			}
		},
		validators: {
			onChange: loginSchema,
		},
	});

	return (
		<div className="min-h-screen flex items-center justify-center px-6 py-12 bg-background">
			<div className="w-full max-w-md">
				<div className="flex items-center justify-center mb-8">
					<Logo size="lg" />
				</div>

				{/* Login Card */}
				<div className="bg-card border border-border rounded-lg p-8">
					<div className="mb-6">
						<h1 className="text-2xl font-semibold mb-2">Welcome back</h1>
						<p className="text-sm text-muted-foreground">
							Sign in to your account to continue
						</p>
					</div>

					<form
						className="space-y-4"
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
					>
						<form.Field name="email">
							{(field) => {
								const shouldShowError =
									field.state.meta.errors.length > 0 &&
									(field.state.meta.isDirty || form.state.isSubmitted);
								return (
									<div className="space-y-2">
										<Label htmlFor="email">Email</Label>
										<Input
											id={"email"}
											type="email"
											placeholder="name@company.com"
											className="h-10"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										{shouldShowError && (
											<p className="text-sm text-destructive">
												{field.state.meta.errors[0]?.message}
											</p>
										)}
									</div>
								);
							}}
						</form.Field>

						<form.Field name="password">
							{(field) => {
								const shouldShowError =
									field.state.meta.errors.length > 0 &&
									(field.state.meta.isDirty || form.state.isSubmitted);
								return (
									<div className="space-y-2">
										<div className="flex items-center justify-between">
											<Label htmlFor="password">Password</Label>
											<Link
												to="/forgot-password"
												className="text-sm text-muted-foreground hover:text-foreground transition-colors"
											>
												Forgot password?
											</Link>
										</div>
										<Input
											id={"password"}
											type="password"
											placeholder="Enter your password"
											className="h-10"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										{shouldShowError && (
											<p className="text-sm text-destructive">
												{field.state.meta.errors[0]?.message}
											</p>
										)}
									</div>
								);
							}}
						</form.Field>

						<Button type="submit" className="w-full h-10" disabled={isLoading}>
							{isLoading ? "Signing in..." : "Sign in"}
						</Button>
					</form>

					<SocialLoginButtons />
				</div>

				{/* Sign up link */}
				<p className="text-center text-sm text-muted-foreground mt-6">
					Don't have an account?{" "}
					<Link
						to="/signup"
						className="text-foreground hover:underline font-medium"
					>
						Sign up
					</Link>
				</p>
			</div>
		</div>
	);
}
