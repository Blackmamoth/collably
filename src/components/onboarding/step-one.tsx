import { Layers, Sparkles } from "lucide-react";

export default function OnboardingStepOne() {
	return (
		<div className="space-y-6">
			<div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
				<Layers className="w-10 h-10 text-primary" />
			</div>
			<div className="space-y-3 text-center max-w-md mx-auto">
				<h2 className="text-3xl font-bold">Welcome to Collably</h2>
				<p className="text-muted-foreground leading-relaxed">
					Transform how your team collaborates with real-time boards designed
					for modern workflows
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
						<h3 className="font-semibold text-sm mb-1">Two Powerful Boards</h3>
						<p className="text-sm text-muted-foreground">
							Decision Board for ideas, Task Board for execution
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
