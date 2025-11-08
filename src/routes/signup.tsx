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
import * as z from "zod";
import { useForm } from "@tanstack/react-form";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { handleSocialLogin } from "@/lib/common/helper";

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

	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
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
						toast.error(ctx.error.message);
					},
				},
			);
		},
		validators: {
			onChange: signUpSchema,
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
							{(field) => (
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
									{field.state.meta.errors.length > 0 && (
										<p className="text-sm text-destructive">
											{field.state.meta.errors[0]?.message}
										</p>
									)}
								</div>
							)}
						</form.Field>

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
									<Label htmlFor="password">Password</Label>
									<Input
										id={"password"}
										type="password"
										placeholder="Create a strong password"
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

						<div className="flex items-start space-x-2 pt-2">
							<Checkbox id={"terms"} required className="mt-0.5" />
							<label
								htmlFor="terms"
								className="text-sm text-muted-foreground cursor-pointer leading-relaxed"
							>
								I agree to the{" "}
								<Link to="." className="text-foreground hover:underline">
									Terms of Service
								</Link>{" "}
								and{" "}
								<Link to="." className="text-foreground hover:underline">
									Privacy Policy
								</Link>
							</label>
						</div>

						<Button type="submit" className="w-full h-10">
							Create account
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
