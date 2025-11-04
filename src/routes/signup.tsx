import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Layers } from "lucide-react";
import { RiGithubLine, RiGoogleFill } from "react-icons/ri";
import { useState } from "react";

export const Route = createFileRoute("/signup")({
	component: SignUpComponent,
});

function SignUpComponent() {
	const [step, setStep] = useState<"signup" | "otp">("signup");
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState(["", "", "", "", "", ""]);
	const [isVerifying, setIsVerifying] = useState(false);

	const handleSignup = (e: React.FormEvent) => {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		const emailValue = formData.get("email") as string;
		setEmail(emailValue);
		setStep("otp");
	};

	const handleOtpChange = (index: number, value: string) => {
		if (value.length > 1) return; // Only allow single digit

		const newOtp = [...otp];
		newOtp[index] = value;
		setOtp(newOtp);

		// Auto-focus next input
		if (value && index < 5) {
			const nextInput = document.getElementById(`otp-${index + 1}`);
			nextInput?.focus();
		}
	};

	const handleVerifyOtp = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsVerifying(true);

		// Mock verification - in real app, this would call an API
		await new Promise((resolve) => setTimeout(resolve, 1500));

		console.log("[v0] OTP verified:", otp.join(""));
		// Redirect to dashboard or onboarding
		window.location.href = "/dashboard";
	};

	const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
		if (e.key === "Backspace" && !otp[index] && index > 0) {
			const prevInput = document.getElementById(`otp-${index - 1}`);
			prevInput?.focus();
		}
	};

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

				{step === "signup" ? (
					// Signup Form
					<div className="bg-card border border-border rounded-lg p-8">
						<div className="mb-6">
							<h1 className="text-2xl font-semibold mb-2">Create an account</h1>
							<p className="text-sm text-muted-foreground">
								Get started with Taskloom for free
							</p>
						</div>

						<form onSubmit={handleSignup} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="name">Full name</Label>
								<Input
									id={"name"}
									name="name"
									type="text"
									placeholder="John Doe"
									className="h-10"
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id={"email"}
									name="email"
									type="email"
									placeholder="name@company.com"
									className="h-10"
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="password">Password</Label>
								<Input
									id={"password"}
									name="password"
									type="password"
									placeholder="Create a strong password"
									className="h-10"
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="confirm-password">Confirm password</Label>
								<Input
									id={"confirm-password"}
									name="confirm-password"
									type="password"
									placeholder="Re-enter your password"
									className="h-10"
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="workspace" className="text-muted-foreground">
									Workspace name <span className="text-xs">(optional)</span>
								</Label>
								<Input
									id={"workspace"}
									name="workspace"
									type="text"
									placeholder="My Team"
									className="h-10"
								/>
							</div>

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
				) : (
					<div className="bg-card border border-border rounded-lg p-8">
						<Button
							variant="ghost"
							size="sm"
							className="mb-4 -ml-2"
							onClick={() => setStep("signup")}
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
								<div className="flex gap-2 justify-between">
									{otp.map((digit, index) => (
										<Input
											key={index}
											id={`otp-${index}`}
											type="text"
											inputMode="numeric"
											maxLength={1}
											value={digit}
											onChange={(e) => handleOtpChange(index, e.target.value)}
											onKeyDown={(e) => handleOtpKeyDown(index, e)}
											className="h-12 w-12 text-center text-lg font-semibold"
											required
										/>
									))}
								</div>
							</div>

							<Button
								type="submit"
								className="w-full h-10"
								disabled={isVerifying || otp.some((d) => !d)}
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
									onClick={() => console.log("[v0] Resending OTP to:", email)}
								>
									Resend
								</button>
							</p>
						</div>
					</div>
				)}

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
