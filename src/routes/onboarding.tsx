import {
	createFileRoute,
	Link,
	redirect,
	useRouteContext,
	useNavigate,
} from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight } from "lucide-react";
import OnboardingStepOne from "@/components/onboarding/step-one";
import OnboardingStepTwo from "@/components/onboarding/step-two";
import OnboardingStepThree from "@/components/onboarding/step-three";
import OnboardingStepFour from "@/components/onboarding/step-four";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { generateSlug } from "@/lib/common/helper";
import { Logo } from "@/components/landing/logo";

export const Route = createFileRoute("/onboarding")({
	component: RouteComponent,
	beforeLoad: ({ context }) => {
		const { user } = context;

		if (user === undefined) {
			throw redirect({ to: "/login" });
		}

		return { user };
	},
});

function RouteComponent() {
	const [currentStep, setCurrentStep] = useState(0);
	const [workspaceName, setWorkspaceName] = useState("");
	const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);

	const { user } = useRouteContext({ from: Route.id });
	const navigate = useNavigate();

	const steps = useMemo(
		() => [
			{
				id: "step-one",
				title: "Welcome to Collably",
				description:
					"Transform how your team collaborates with real-time boards designed for modern workflows",
				content: OnboardingStepOne(),
			},
			{
				id: "step-two",
				title: "Create Your Workspace",
				description: "Set up your workspace to get started",
				content: OnboardingStepTwo({ workspaceName, setWorkspaceName }),
			},
			{
				id: "step-three",
				title: "Decision Board",
				description: "Brainstorm and organize ideas with colorful sticky notes",
				content: OnboardingStepThree(),
			},
			{
				id: "step-four",
				title: "Task Board",
				description: "Manage tasks with a powerful Kanban board",
				content: OnboardingStepFour(),
			},
		],
		[workspaceName],
	);

	const progress = ((currentStep + 1) / steps.length) * 100;

	const handleNext = async () => {
		if (currentStep >= steps.length - 1) return;

		if (currentStep === 1 && workspaceName.trim() !== "") {
			setIsCreatingWorkspace(true);
			try {
				const { data, error } = await authClient.organization.create({
					name: workspaceName,
					slug: generateSlug(workspaceName),
					userId: user.id,
				});

				if (error) {
					toast.error(
						error?.message || "Workspace could not be created! Please try again.",
					);
					return;
				}

				if (data) {
					await authClient.organization.setActive({
						organizationId: data.id,
						organizationSlug: data.slug,
					});
				}
			} finally {
				setIsCreatingWorkspace(false);
			}
		}

		setCurrentStep(currentStep + 1);
	};

	const handlePrevious = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
		}
	};

	const handleSkip = () => {
		navigate({ to: "/dashboard" });
	};

	const canProceed = currentStep !== 1 || workspaceName.trim() !== "";

	return (
		<div className="min-h-screen bg-background flex flex-col">
			{/* Header */}
			<div className="border-b border-border">
				<div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
					<Logo size="md" />
					<Button variant="ghost" onClick={handleSkip}>
						Skip
					</Button>
				</div>
			</div>

			{/* Progress bar */}
			<div className="border-b border-border">
				<div className="max-w-7xl mx-auto px-6">
					<Progress value={progress} className="h-1 rounded-none" />
				</div>
			</div>

			{/* Content */}
			<div className="flex-1 flex items-center justify-center px-6 py-12">
				<div className="w-full max-w-4xl">{steps[currentStep].content}</div>
			</div>

			{/* Navigation */}
			<div className="border-t border-border">
				<div className="max-w-7xl mx-auto px-6 py-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							{steps.map((step, index) => (
								<button
									type="button"
									key={step.id}
									onClick={() => setCurrentStep(index)}
									className={`w-2 h-2 rounded-full transition-all ${
										index === currentStep
											? "bg-primary w-8"
											: index < currentStep
												? "bg-primary/50"
												: "bg-muted"
									}`}
									aria-label={`Go to step ${index + 1}`}
								/>
							))}
						</div>

						<div className="flex items-center gap-3">
							{currentStep > 0 && (
								<Button
									variant="outline"
									onClick={handlePrevious}
									disabled={isCreatingWorkspace}
								>
									Previous
								</Button>
							)}
							{currentStep < steps.length - 1 ? (
								<Button
									onClick={handleNext}
									disabled={!canProceed || isCreatingWorkspace}
								>
									{isCreatingWorkspace ? "Creating..." : "Next"}
									{!isCreatingWorkspace && (
										<ArrowRight className="w-4 h-4 ml-2" />
									)}
								</Button>
							) : (
								<Link to="/dashboard">
									<Button>
										Get Started
										<ArrowRight className="w-4 h-4 ml-2" />
									</Button>
								</Link>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
