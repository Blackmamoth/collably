import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import type { Feature } from "@/lib/landing-data";

interface FeatureCardProps {
	feature: Feature;
}

export function FeatureCard({ feature }: FeatureCardProps) {
	const Icon = feature.icon;

	return (
		<Card className="p-8 bg-card border-border hover:border-muted-foreground/20 transition-colors">
			<div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
				<Icon className="w-6 h-6 text-primary" />
			</div>
			<h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
			<p className="text-muted-foreground leading-relaxed mb-6">
				{feature.description}
			</p>
			<ul className="space-y-3">
				{feature.items.map((item, index) => (
					<li key={index} className="flex items-start gap-3">
						<CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
						<span className="text-sm text-muted-foreground">{item}</span>
					</li>
				))}
			</ul>
		</Card>
	);
}

