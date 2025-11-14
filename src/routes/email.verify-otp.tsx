import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Layers, ArrowLeft } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useSearch } from "@tanstack/react-router";

interface SearchParams {
	email: string;
}

export const Route = createFileRoute("/email/verify-otp")({
	component: RouteComponent,
	validateSearch: (search: Record<string, unknown>): SearchParams => {
		return {
			email: (search.email as string) || "",
		};
	},
});

function RouteComponent() {
	// const {} = useRouteContext({ from: Route.id });

	const { email } = useSearch({ from: Route.id });

	const navigate = useNavigate();

	if (!email) {
		navigate({ to: "/" });
	}

	const [otp, setOtp] = useState("");
	const [isVerifying, setIsVerifying] = useState(false);

	const handleVerifyOtp = async (e: React.FormEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsVerifying(true);

		await authClient.emailOtp.verifyEmail({ email, otp });

		navigate({ to: "/dashboard" });
	};

	const handleResendOtp = () => {
		console.log("[v0] Resending OTP to:", email);
		setOtp("");
	};

	return (
		<div className="min-h-screen flex items-center justify-center px-6 py-12 bg-background">
			<div className="w-full max-w-md">
				<Link to="/" className="flex items-center justify-center gap-2 mb-8">
					<div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
						<Layers className="w-6 h-6 text-primary-foreground" />
					</div>
					<span className="text-2xl font-semibold tracking-tight">
						Collably
					</span>
				</Link>

				<div className="bg-card border border-border rounded-lg p-8">
					<Button
						variant="ghost"
						size="sm"
						className="mb-4 -ml-2"
						onClick={() => navigate({ to: "/signup" })}
					>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back
					</Button>

					<div className="mb-6">
						<h1 className="text-2xl font-semibold mb-2">Verify your email</h1>
						<p className="text-sm text-muted-foreground">
							We sent a verification code to{" "}
							<span className="text-foreground font-medium">{email}</span>
						</p>
					</div>

					<form onSubmit={handleVerifyOtp} className="space-y-6">
						<div className="space-y-2">
							<Label>Enter verification code</Label>
							<div className="flex justify-center">
								<InputOTP
									maxLength={6}
									value={otp}
									onChange={(value) => setOtp(value)}
								>
									<InputOTPGroup>
										<InputOTPSlot index={0} />
										<InputOTPSlot index={1} />
										<InputOTPSlot index={2} />
										<InputOTPSlot index={3} />
										<InputOTPSlot index={4} />
										<InputOTPSlot index={5} />
									</InputOTPGroup>
								</InputOTP>
							</div>
						</div>

						<Button
							type="submit"
							className="w-full h-10"
							disabled={isVerifying || otp.length < 6}
						>
							{isVerifying ? "Verifying..." : "Verify email"}
						</Button>
					</form>

					<div className="mt-6 text-center">
						<p className="text-sm text-muted-foreground">
							Didn't receive the code?{" "}
							<button
								type="button"
								className="text-foreground hover:underline font-medium"
								onClick={handleResendOtp}
							>
								Resend
							</button>
						</p>
					</div>
				</div>

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
