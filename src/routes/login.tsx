import {
	createFileRoute,
	Link,
	redirect,
	useNavigate,
} from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Layers } from "lucide-react";
import { RiGithubLine, RiGoogleFill } from "react-icons/ri";
import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { handleSocialLogin } from "@/lib/common/helper";

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

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signIn.email(
				{
					email: value.email,
					password: value.password,
					callbackURL: "/dashboard",
				},
				{
					onError: async (ctx) => {
						if (ctx.error.message === "Email not verified") {
							const { error } = await authClient.emailOtp.sendVerificationOtp({
								email: value.email,
								type: "email-verification",
							});
							if (error !== null) {
								toast.error(
									error.message ||
										"An error occured while sending verification code, please try again!",
								);
								return;
							}

							navigate({
								to: "/email/verify-otp",
								search: { email: value.email },
							});
						}
					},
				},
			);
		},
		validators: {
			onChange: loginSchema,
		},
	});

	return (
		<div className="min-h-screen flex items-center justify-center px-6 py-12 bg-background">
			<div className="w-full max-w-md">
				{/* Logo */}
				<Link to="/" className="flex items-center justify-center gap-2 mb-8">
					<div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
						<Layers className="w-6 h-6 text-primary-foreground" />
					</div>
					<span className="text-2xl font-semibold tracking-tight">
						Collably
					</span>
				</Link>

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
							{(field) => (
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
									{field.state.meta.errors.length > 0 && (
										<p className="text-sm text-destructive">
											{field.state.meta.errors[0]?.message}
										</p>
									)}
								</div>
							)}
						</form.Field>

						<form.Field name="password">
							{(field) => (
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
									{field.state.meta.errors.length > 0 && (
										<p className="text-sm text-destructive">
											{field.state.meta.errors[0]?.message}
										</p>
									)}
								</div>
							)}
						</form.Field>

						<div className="flex items-center space-x-2">
							<Checkbox id={"remember"} />
							<label
								htmlFor="remember"
								className="text-sm text-muted-foreground cursor-pointer"
							>
								Remember me for 30 days
							</label>
						</div>

						<Button type="submit" className="w-full h-10">
							Sign in
						</Button>
					</form>

					<div className="relative my-6">
						<Separator />
						<span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
							or continue with
						</span>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<Button
							variant="outline"
							className="h-10 bg-transparent"
							onClick={() => handleSocialLogin("google")}
						>
							<RiGoogleFill className="w-4 h-4" />
							Google
						</Button>
						<Button
							variant="outline"
							className="h-10 bg-transparent"
							onClick={() => handleSocialLogin("github")}
						>
							<RiGithubLine className="w-4 h-4" />
							GitHub
						</Button>
					</div>
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
