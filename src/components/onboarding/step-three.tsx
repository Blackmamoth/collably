import { Layers, Sparkles } from "lucide-react";

export default function OnboardingStepThree() {
	return (
		<div className="space-y-6">
			<div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
				<Layers className="w-10 h-10 text-primary" />
			</div>
			<div className="space-y-3 text-center max-w-md mx-auto">
				<h2 className="text-3xl font-bold">Decision Board</h2>
				<p className="text-muted-foreground leading-relaxed">
					Brainstorm and organize ideas with colorful sticky notes. Perfect for
					team ideation sessions.
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
						<p className="text-xs text-muted-foreground">Improve mobile UX</p>
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
						<p className="text-xs text-muted-foreground">Q3 roadmap planning</p>
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
	);
}
