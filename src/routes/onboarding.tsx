import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Layers, ArrowRight, Sparkles, Kanban } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
	component: RouteComponent,
});

function RouteComponent() {
	const [currentStep, setCurrentStep] = useState(0);

	const steps = [
		{
			title: "Welcome to Taskloom",
			description:
				"Transform how your team collaborates with real-time boards designed for modern workflows",
			icon: Layers,
			content: (
				<div className="space-y-6">
					<div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
						<Layers className="w-10 h-10 text-primary" />
					</div>
					<div className="space-y-3 text-center max-w-md mx-auto">
						<h2 className="text-3xl font-bold">Welcome to Taskloom</h2>
						<p className="text-muted-foreground leading-relaxed">
							Transform how your team collaborates with real-time boards
							designed for modern workflows
						</p>
					</div>
					<div className="grid gap-4 max-w-md mx-auto pt-4">
						<div className="flex items-start gap-3 p-4 bg-card border border-border rounded-lg">
							<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
								<Sparkles className="w-4 h-4 text-primary" />
							</div>
							<div>
								<h3 className="font-semibold text-sm mb-1">
									Real-time Collaboration
								</h3>
								<p className="text-sm text-muted-foreground">
									See your team's changes instantly
								</p>
							</div>
						</div>
						<div className="flex items-start gap-3 p-4 bg-card border border-border rounded-lg">
							<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
								<Layers className="w-4 h-4 text-primary" />
							</div>
							<div>
								<h3 className="font-semibold text-sm mb-1">
									Two Powerful Boards
								</h3>
								<p className="text-sm text-muted-foreground">
									Decision Board for ideas, Task Board for execution
								</p>
							</div>
						</div>
					</div>
				</div>
			),
		},
		{
			title: "Decision Board",
			description: "Brainstorm and organize ideas with colorful sticky notes",
			icon: Layers,
			content: (
				<div className="space-y-6">
					<div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
						<Layers className="w-10 h-10 text-primary" />
					</div>
					<div className="space-y-3 text-center max-w-md mx-auto">
						<h2 className="text-3xl font-bold">Decision Board</h2>
						<p className="text-muted-foreground leading-relaxed">
							Brainstorm and organize ideas with colorful sticky notes. Perfect
							for team ideation sessions.
						</p>
					</div>

					{/* Visual representation of Decision Board */}
					<div className="max-w-2xl mx-auto p-6 bg-card border border-border rounded-lg">
						<div className="grid grid-cols-3 gap-3">
							<div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
								<p className="text-sm font-medium mb-2">Feature idea</p>
								<p className="text-xs text-muted-foreground">
									Add dark mode support
								</p>
							</div>
							<div className="p-4 bg-pink-500/10 border border-pink-500/20 rounded-lg">
								<p className="text-sm font-medium mb-2">User feedback</p>
								<p className="text-xs text-muted-foreground">
									Improve mobile UX
								</p>
							</div>
							<div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
								<p className="text-sm font-medium mb-2">Bug report</p>
								<p className="text-xs text-muted-foreground">Fix login issue</p>
							</div>
							<div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
								<p className="text-sm font-medium mb-2">Enhancement</p>
								<p className="text-xs text-muted-foreground">
									Add keyboard shortcuts
								</p>
							</div>
							<div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
								<p className="text-sm font-medium mb-2">Discussion</p>
								<p className="text-xs text-muted-foreground">
									Q3 roadmap planning
								</p>
							</div>
							<div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
								<p className="text-sm font-medium mb-2">Action item</p>
								<p className="text-xs text-muted-foreground">
									Schedule team meeting
								</p>
							</div>
						</div>
					</div>

					<div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 rounded-full bg-primary" />
							<span>Drag & drop</span>
						</div>
						<div className="flex items-center gap-2">
							<Sparkles className="w-4 h-4" />
							<span>AI summaries</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 rounded-full bg-primary" />
							<span>Live cursors</span>
						</div>
					</div>
				</div>
			),
		},
		{
			title: "Task Board",
			description: "Manage tasks with a powerful Kanban board",
			icon: Kanban,
			content: (
				<div className="space-y-6">
					<div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
						<Kanban className="w-10 h-10 text-primary" />
					</div>
					<div className="space-y-3 text-center max-w-md mx-auto">
						<h2 className="text-3xl font-bold">Task Board</h2>
						<p className="text-muted-foreground leading-relaxed">
							Manage tasks with a powerful Kanban board. Track progress from
							idea to completion.
						</p>
					</div>

					{/* Visual representation of Task Board */}
					<div className="max-w-3xl mx-auto p-6 bg-card border border-border rounded-lg">
						<div className="grid grid-cols-3 gap-4">
							<div>
								<div className="text-sm font-medium mb-3 text-muted-foreground">
									To Do
								</div>
								<div className="space-y-2">
									<div className="p-3 bg-background border border-border rounded-lg">
										<p className="text-sm font-medium mb-1">
											Design new landing page
										</p>
										<div className="flex items-center gap-2 mt-2">
											<div className="w-5 h-5 rounded-full bg-primary/20" />
											<span className="text-xs text-muted-foreground">
												Due: Mar 15
											</span>
										</div>
									</div>
									<div className="p-3 bg-background border border-border rounded-lg">
										<p className="text-sm font-medium mb-1">
											Update documentation
										</p>
										<div className="flex items-center gap-2 mt-2">
											<div className="w-5 h-5 rounded-full bg-primary/20" />
											<span className="text-xs text-muted-foreground">
												Due: Mar 18
											</span>
										</div>
									</div>
								</div>
							</div>
							<div>
								<div className="text-sm font-medium mb-3 text-muted-foreground">
									In Progress
								</div>
								<div className="space-y-2">
									<div className="p-3 bg-background border border-primary/50 rounded-lg">
										<p className="text-sm font-medium mb-1">
											Implement auth system
										</p>
										<div className="flex items-center gap-2 mt-2">
											<div className="w-5 h-5 rounded-full bg-primary/20" />
											<span className="text-xs text-muted-foreground">
												Due: Mar 12
											</span>
										</div>
									</div>
								</div>
							</div>
							<div>
								<div className="text-sm font-medium mb-3 text-muted-foreground">
									Done
								</div>
								<div className="space-y-2">
									<div className="p-3 bg-background border border-border rounded-lg opacity-60">
										<p className="text-sm font-medium mb-1">
											Setup project repo
										</p>
										<div className="flex items-center gap-2 mt-2">
											<div className="w-5 h-5 rounded-full bg-primary/20" />
											<span className="text-xs text-muted-foreground">
												Completed
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 rounded-full bg-primary" />
							<span>Assignees</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 rounded-full bg-primary" />
							<span>Due dates</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 rounded-full bg-primary" />
							<span>Priority tags</span>
						</div>
					</div>
				</div>
			),
		},
	];

	const progress = ((currentStep + 1) / steps.length) * 100;

	const handleNext = () => {
		if (currentStep < steps.length - 1) {
			setCurrentStep(currentStep + 1);
		}
	};

	const handlePrevious = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
		}
	};

	const handleSkip = () => {
		// Navigate to dashboard
		window.location.href = "/dashboard";
	};

	return (
		<div className="min-h-screen bg-background flex flex-col">
			{/* Header */}
			<div className="border-b border-border">
				<div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
							<Layers className="w-5 h-5 text-primary-foreground" />
						</div>
						<span className="text-xl font-semibold tracking-tight">
							Taskloom
						</span>
					</div>
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
							{steps.map((_, index) => (
								<button
									key={index}
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
								<Button variant="outline" onClick={handlePrevious}>
									Previous
								</Button>
							)}
							{currentStep < steps.length - 1 ? (
								<Button onClick={handleNext}>
									Next
									<ArrowRight className="w-4 h-4 ml-2" />
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
