import { Kanban } from "lucide-react";

export default function OnboardingStepFour() {
	return (
		<div className="space-y-6">
			<div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
				<Kanban className="w-10 h-10 text-primary" />
			</div>
			<div className="space-y-3 text-center max-w-md mx-auto">
				<h2 className="text-3xl font-bold">Task Board</h2>
				<p className="text-muted-foreground leading-relaxed">
					Manage tasks with a powerful Kanban board. Track progress from idea to
					completion.
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
								<p className="text-sm font-medium mb-1">Update documentation</p>
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
								<p className="text-sm font-medium mb-1">Setup project repo</p>
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
	);
}
