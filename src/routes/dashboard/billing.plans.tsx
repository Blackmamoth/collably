import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { CheckoutDialog, useCustomer } from "autumn-js/react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Plan {
	id: string;
	name: string;
	price: number | string;
	interval?: string;
	description: string;
	features: string[];
	recommended?: boolean;
	cta: string;
}

const plans: Plan[] = [
	{
		id: "free",
		name: "Free",
		price: 0,
		interval: "month",
		description: "Perfect for small teams",
		features: [
			"Up to 5 team members",
			"Up to 5 projects",
			"50 AI credits for board summary and subtask generation",
			"Standard support",
		],
		cta: "Current Plan",
	},
	{
		id: "pro",
		name: "Pro",
		price: 12,
		interval: "month",
		description: "For growing teams",
		features: [
			"Up to 50 team members",
			"Unlimited projects",
			"500 AI credits for board summary and subtask generation",
			"Priority support",
			"Custom integrations",
			"Advanced analytics",
		],
		recommended: true,
		cta: "Upgrade to Pro",
	},
	{
		id: "enterprise",
		name: "Enterprise",
		price: "Custom",
		description: "For large organizations",
		features: [
			"Unlimited team members",
			"Custom integrations",
			"Dedicated support",
			"SLA guarantee",
			"Custom contracts",
			"Advanced security",
		],
		cta: "Contact Sales",
	},
];

export const Route = createFileRoute("/dashboard/billing/plans")({
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
	const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);

	const { attach, customer } = useCustomer();

	const currentPlanId = useMemo(() => {
		return customer?.products[0]?.id || null;
	}, [customer?.products]);

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="border-b border-border">
				<div className="max-w-7xl mx-auto px-6 py-4">
					<div className="flex items-center gap-4">
						<Link to="/dashboard/workspace/settings">
							<Button variant="ghost" size="icon">
								<ArrowLeft className="w-5 h-5" />
							</Button>
						</Link>
						<div>
							<h1 className="text-3xl font-bold tracking-tight">
								Choose Your Plan
							</h1>
							<p className="text-muted-foreground mt-1">
								Select the plan that works best for your team
							</p>
						</div>
					</div>
				</div>
			</header>

			{/* Plans Grid */}
			<div className="max-w-7xl mx-auto px-6 py-16">
				<div className="grid lg:grid-cols-3 gap-8 mb-12">
					{plans.map((plan) => {
						const isCurrent = plan.id === currentPlanId;
						const isSelected = plan.id === selectedPlan;

						return (
							<div
								key={plan.id}
								className={`relative rounded-2xl border bg-card transition-all duration-300 ${
									plan.recommended
										? "border-primary shadow-2xl scale-105 ring-2 ring-primary/20"
										: "border-border shadow-lg hover:shadow-xl"
								} ${isSelected ? "ring-2 ring-primary ring-offset-2" : ""}`}
							>
								{/* Badge */}
								{(plan.recommended || isCurrent) && (
									<div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
										{plan.recommended && !isCurrent ? (
											<Badge className="bg-primary text-primary-foreground px-5 py-2 text-sm font-semibold shadow-lg">
												Most Popular
											</Badge>
										) : isCurrent ? (
											<Badge
												variant="secondary"
												className="px-5 py-2 text-sm font-semibold shadow-md"
											>
												Current Plan
											</Badge>
										) : null}
									</div>
								)}

								<div className="p-10 flex flex-col h-full">
									{/* Plan Header */}
									<div className="mb-10">
										<h3 className="text-2xl font-bold mb-6">{plan.name}</h3>
										<div className="flex items-baseline gap-2 mb-6">
											{typeof plan.price === "number" ? (
												<>
													<span className="text-6xl font-bold tracking-tight">
														${plan.price}
													</span>
													{plan.interval && (
														<span className="text-lg text-muted-foreground">
															/{plan.interval}
														</span>
													)}
												</>
											) : (
												<span className="text-6xl font-bold tracking-tight">
													{plan.price}
												</span>
											)}
										</div>
										<p className="text-base text-muted-foreground leading-relaxed">
											{plan.description}
										</p>
									</div>

									{/* CTA Button */}
									<Button
										className="w-full mb-10 h-12 text-base"
										size="lg"
										variant={
											isCurrent
												? "secondary"
												: plan.recommended
													? "default"
													: "outline"
										}
										disabled={isCurrent || isProcessing}
										onClick={async () => {
											setSelectedPlan(plan.id);
											setIsProcessing(true);
											try {
												await attach({
													productId: plan.id,
													dialog: CheckoutDialog,
													successUrl: `${import.meta.env.VITE_APP_HOST}/dashboard/workspace/settings`,
												});
											} catch (error) {
												toast.error(
													error instanceof Error
														? error.message
														: "Failed to process plan selection. Please try again.",
												);
												setSelectedPlan(null);
											} finally {
												setIsProcessing(false);
											}
										}}
									>
										{isProcessing && isSelected
											? "Processing..."
											: isCurrent
												? "Current Plan"
												: plan.id === "enterprise"
													? "Contact Sales"
													: plan.cta}
									</Button>

									{/* Features */}
									<div className="space-y-5 flex-1">
										{plan.features.map((feature) => (
											<div key={feature} className="flex items-start gap-4">
												<CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
												<span className="text-base text-foreground leading-relaxed">
													{feature}
												</span>
											</div>
										))}
									</div>
								</div>
							</div>
						);
					})}
				</div>

				{/* Footer Note */}
				<div className="max-w-2xl mx-auto p-8 bg-muted/50 rounded-2xl border border-border">
					<p className="text-center text-muted-foreground leading-relaxed">
						All plans include a 14-day free trial. Cancel anytime with no
						questions asked. Need help choosing?{" "}
						<Link to="." className="text-primary hover:underline font-medium">
							Contact our sales team
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
