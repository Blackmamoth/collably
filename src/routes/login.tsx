import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Layers } from "lucide-react";
import { RiGithubLine, RiGoogleFill } from "react-icons/ri";

export const Route = createFileRoute("/login")({
	component: LoginComponent,
});

function LoginComponent() {
	return (
		<div className="min-h-screen flex items-center justify-center px-6 py-12 bg-background">
			<div className="w-full max-w-md">
				{/* Logo */}
				<Link to="/" className="flex items-center justify-center gap-2 mb-8">
					<div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
						<Layers className="w-6 h-6 text-primary-foreground" />
					</div>
					<span className="text-2xl font-semibold tracking-tight">
						Taskloom
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

					<form className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id={"email"}
								type="email"
								placeholder="name@company.com"
								className="h-10"
							/>
						</div>

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
							/>
						</div>

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
						<Button variant="outline" className="h-10 bg-transparent">
							<RiGoogleFill className="w-4 h-4" />
							Google
						</Button>
						<Button variant="outline" className="h-10 bg-transparent">
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
