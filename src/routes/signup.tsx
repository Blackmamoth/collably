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

const signUpSchema = z.object({
	name: z.string().min(1, "name is required"),
	email: z.email({ message: "please provide a valid email address" }),
	password: z
		.string()
		.min(8, "password should have minimum of 8 characters")
		.max(16, "password should have maximum of 16 characters"),
});

export const Route = createFileRoute("/signup")({
	component: SignUpComponent,
	beforeLoad: ({ context }) => {
		const { user } = context;

		if (user !== undefined) {
			throw redirect({ to: "/dashboard" });
		}
	},
});

function SignUpComponent() {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			setIsLoading(true);
			try {
				await authClient.signUp.email(
					{
						name: value.name,
						email: value.email,
						password: value.password,
					},
					{
						onSuccess: () => {
							navigate({
								to: "/email/verify-otp",
								search: { email: value.email },
							});
						},
						onError: (ctx) => {
							toast.error(
								ctx.error.message || "Failed to create account. Please try again.",
							);
						},
					},
				);
			} finally {
				setIsLoading(false);
			}
		},
		validators: {
			onChange: signUpSchema,
		},
	});

	return (
		<div className="min-h-screen flex items-center justify-center px-6 py-12 bg-background">
			<div className="w-full max-w-md">
				<div className="flex items-center justify-center mb-8">
					<Logo size="lg" />
				</div>

				<div className="bg-card border border-border rounded-lg p-8">
					<div className="mb-6">
						<h1 className="text-2xl font-semibold mb-2">Create an account</h1>
						<p className="text-sm text-muted-foreground">
							Get started with Collably for free
						</p>
					</div>

					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
						className="space-y-4"
					>
						<form.Field name="name">
							{(field) => {
								const shouldShowError =
									field.state.meta.errors.length > 0 &&
									(field.state.meta.isDirty || form.state.isSubmitted);
								return (
									<div className="space-y-2">
										<Label htmlFor="name">Full name</Label>
										<Input
											id={"name"}
											type="text"
											placeholder="John Doe"
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
										<Label htmlFor="password">Password</Label>
										<Input
											id={"password"}
											type="password"
											placeholder="Create a strong password"
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

						<Button
							type="submit"
							className="w-full h-10"
							disabled={isLoading}
						>
							{isLoading ? "Creating account..." : "Create account"}
						</Button>
					</form>

					<SocialLoginButtons />
				</div>

				{/* Sign in link */}
				<p className="text-center text-sm text-muted-foreground mt-6">
					Already have an account?{" "}
					<Link
						to="/login"
						className="text-foreground hover:underline font-medium"
					>
						Sign in
					</Link>
				</p>
			</div>
		</div>
	);
}
