import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { PricingPlan } from "@/lib/landing-data";

interface PricingCardProps {
	plan: PricingPlan;
	isLoggedIn: boolean;
}

export function PricingCard({ plan, isLoggedIn }: PricingCardProps) {
	const isRecommended = plan.recommended;

	return (
		<Card
			className={`p-8 bg-card border-border transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
				isRecommended
					? "border-primary relative hover:shadow-primary/20"
					: "hover:border-primary/50"
			}`}
		>
			{isRecommended && (
				<Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
					Most Popular
				</Badge>
			)}
			<div className="mb-6">
				<h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
				<div className="flex items-baseline gap-1 mb-4">
					{typeof plan.price === "number" ? (
						<>
							<span className="text-4xl font-bold">${plan.price}</span>
							{plan.interval && (
								<span className="text-muted-foreground">/{plan.interval}</span>
							)}
						</>
					) : (
						<span className="text-4xl font-bold">{plan.price}</span>
					)}
				</div>
				<p className="text-sm text-muted-foreground">{plan.description}</p>
			</div>
			{!isLoggedIn && (
				<Button
					variant={isRecommended ? "default" : "outline"}
					className={`w-full mb-6 ${!isRecommended ? "bg-transparent" : ""}`}
					asChild
				>
					<Link to="/signup">{plan.buttonText || "Get Started"}</Link>
				</Button>
			)}
			<ul className="space-y-3">
				{plan.features.map((feature, index) => (
					<li key={index} className="flex items-start gap-3">
						<CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
						<span className="text-sm">{feature}</span>
					</li>
				))}
			</ul>
		</Card>
	);
}

