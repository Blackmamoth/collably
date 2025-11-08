import { Plus, Users } from "lucide-react";
import { Card } from "../ui/card";
import type { SetStateAction } from "react";

interface Props {
	setIsCreateProjectOpen: React.Dispatch<SetStateAction<boolean>>;
}

export default function DashboardQuickActions({
	setIsCreateProjectOpen,
}: Props) {
	return (
		<div className="grid md:grid-cols-2 gap-4">
			<Card
				className="p-6 bg-card border-border hover:border-muted-foreground/20 transition-colors cursor-pointer group"
				onClick={() => setIsCreateProjectOpen(true)}
			>
				<div className="flex items-start justify-between mb-4">
					<div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
						<Plus className="w-6 h-6 text-primary" />
					</div>
				</div>
				<h3 className="text-lg font-semibold mb-2">Create New Project</h3>
				<p className="text-sm text-muted-foreground">
					Start a new project with Decision Board and Task Board
				</p>
			</Card>

			<Card className="p-6 bg-card border-border hover:border-muted-foreground/20 transition-colors">
				<div className="flex items-start justify-between mb-4">
					<div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
						<Users className="w-6 h-6 text-primary" />
					</div>
				</div>
				<h3 className="text-lg font-semibold mb-2">Invite Team Members</h3>
				<p className="text-sm text-muted-foreground">
					Collaborate with your team in real-time
				</p>
			</Card>
		</div>
	);
}
