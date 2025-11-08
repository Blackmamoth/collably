import type { SetStateAction } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Building2, Sparkles } from "lucide-react";

interface Props {
	workspaceName: string;
	setWorkspaceName: React.Dispatch<SetStateAction<string>>;
}

export default function OnboardingStepTwo({
	workspaceName,
	setWorkspaceName,
}: Props) {
	return (
		<div className="space-y-6">
			<div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
				<Building2 className="w-10 h-10 text-primary" />
			</div>
			<div className="space-y-3 text-center max-w-md mx-auto">
				<h2 className="text-3xl font-bold">Create Your Workspace</h2>
				<p className="text-muted-foreground leading-relaxed">
					Give your workspace a name. You can always change this later in
					settings.
				</p>
			</div>
			<div className="max-w-md mx-auto space-y-4">
				<div className="space-y-2">
					<Label htmlFor="workspace-name">Workspace name</Label>
					<Input
						id={"workspace-name"}
						type="text"
						placeholder="My Team, Acme Inc, Personal Projects..."
						value={workspaceName}
						onChange={(e) => setWorkspaceName(e.target.value)}
						className="h-12 text-base"
						autoFocus
					/>
					<p className="text-xs text-muted-foreground">
						This is the name that will appear in your workspace selector
					</p>
				</div>
				<div className="p-4 bg-card border border-border rounded-lg">
					<div className="flex items-start gap-3">
						<Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
						<div className="space-y-1">
							<p className="text-sm font-medium">Pro tip</p>
							<p className="text-sm text-muted-foreground">
								Use your company name for team workspaces, or something personal
								for individual projects
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
