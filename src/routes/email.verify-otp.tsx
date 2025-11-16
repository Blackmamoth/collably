import { createFileRoute, Link, redirect, useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/landing/logo";
import { Button } from "@/components/ui/button";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

interface SearchParams {
	email: string;
}

export const Route = createFileRoute("/email/verify-otp")({
	component: RouteComponent,
	beforeLoad: ({ context }) => {
		const { user } = context;

		if (user !== undefined) {
			throw redirect({ to: "/dashboard" });
		}
	},
	validateSearch: (search: Record<string, unknown>): SearchParams => {
		return {
			email: (search.email as string) || "",
		};
	},
});

function RouteComponent() {
	const { email } = useSearch({ from: Route.id });
	const navigate = useNavigate();

	const [otp, setOtp] = useState("");
	const [isVerifying, setIsVerifying] = useState(false);
	const [isResending, setIsResending] = useState(false);

	useEffect(() => {
		if (!email) {
			navigate({ to: "/" });
		}
	}, [email, navigate]);

	const handleVerifyOtp = async (e: React.FormEvent) => {
		e.preventDefault();
		e.stopPropagation();
		
		if (otp.length < 6) return;

		setIsVerifying(true);
		try {
			const { error } = await authClient.emailOtp.verifyEmail({ email, otp });

			if (error) {
				toast.error(
					error.message || "Invalid verification code. Please try again.",
				);
				return;
			}

			toast.success("Email verified successfully!");
			navigate({ to: "/dashboard" });
		} catch {
			toast.error("An error occurred during verification. Please try again.");
		} finally {
			setIsVerifying(false);
		}
	};

	const handleResendOtp = async () => {
		if (!email) return;

		setIsResending(true);
		try {
			const { error } = await authClient.emailOtp.sendVerificationOtp({
				email,
				type: "email-verification",
			});

			if (error) {
				toast.error(
					error.message ||
						"Failed to resend verification code. Please try again.",
				);
				return;
			}

			toast.success("Verification code sent! Please check your email.");
			setOtp("");
		} catch {
			toast.error("An error occurred. Please try again.");
		} finally {
			setIsResending(false);
		}
	};

	if (!email) {
		return null;
	}

	return (
		<div className="min-h-screen flex items-center justify-center px-6 py-12 bg-background">
			<div className="w-full max-w-md">
				<div className="flex items-center justify-center mb-8">
					<Logo size="lg" />
				</div>

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
								className="text-foreground hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
								onClick={handleResendOtp}
								disabled={isResending}
							>
								{isResending ? "Sending..." : "Resend"}
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
