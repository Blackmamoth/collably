import { Card } from "@/components/ui/card";
import type { AdditionalFeature } from "@/lib/landing-data";

interface AdditionalFeatureCardProps {
	feature: AdditionalFeature;
}

export function AdditionalFeatureCard({ feature }: AdditionalFeatureCardProps) {
	const Icon = feature.icon;

	return (
		<Card className="p-6 bg-card border-border">
			<Icon className="w-8 h-8 text-primary mb-4" />
			<h4 className="font-semibold mb-2">{feature.title}</h4>
			<p className="text-sm text-muted-foreground leading-relaxed">
				{feature.description}
			</p>
		</Card>
	);
}

