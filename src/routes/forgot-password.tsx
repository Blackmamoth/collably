import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layers, ArrowLeft, Mail } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
	component: RouteComponent,
});

function RouteComponent() {
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

				{/* Reset Password Card */}
				<div className="bg-card border border-border rounded-lg p-8">
					<div className="mb-6">
						<h1 className="text-2xl font-semibold mb-2">Reset your password</h1>
						<p className="text-sm text-muted-foreground leading-relaxed">
							Enter your email address and we'll send you a link to reset your
							password
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

						<Button type="submit" className="w-full h-10">
							<Mail className="w-4 h-4 mr-2" />
							Send reset link
						</Button>
					</form>

					{/* Success state (hidden by default, shown after submission) */}
					<div className="hidden mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
						<div className="flex items-start gap-3">
							<div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
								<Mail className="w-3 h-3 text-primary" />
							</div>
							<div>
								<p className="text-sm font-medium mb-1">Check your email</p>
								<p className="text-sm text-muted-foreground leading-relaxed">
									We've sent a password reset link to your email address. Please
									check your inbox and follow the instructions.
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Back to login link */}
				<Link
					to="/login"
					className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mt-6"
				>
					<ArrowLeft className="w-4 h-4" />
					Back to login
				</Link>
			</div>
		</div>
	);
}
