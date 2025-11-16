import { Layers, Kanban, Users, Zap, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface PricingPlan {
	id: string;
	name: string;
	price: number | "Custom";
	interval?: string;
	description: string;
	features: string[];
	recommended?: boolean;
	buttonText?: string;
}

export interface Feature {
	icon: LucideIcon;
	title: string;
	description: string;
	items: string[];
}

export interface AdditionalFeature {
	icon: LucideIcon;
	title: string;
	description: string;
}

export const pricingPlans: PricingPlan[] = [
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
		buttonText: "Get Started",
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
		buttonText: "Get Started",
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
		buttonText: "Contact Sales",
	},
];

export const mainFeatures: Feature[] = [
	{
		icon: Layers,
		title: "Decision Board",
		description:
			"Brainstorm with colorful sticky notes. Drag, drop, and organize ideas in real-time. AI-powered summaries help distill insights instantly.",
		items: [
			"Real-time collaboration with live cursors",
			"AI-generated summaries and insights",
			"Color-coded sticky notes for organization",
		],
	},
	{
		icon: Kanban,
		title: "Task Board",
		description:
			"Kanban-style task management that keeps your team aligned. Drag tasks across columns and track progress effortlessly.",
		items: [
			"Intuitive drag-and-drop interface",
			"Assignees, due dates, and priority tags",
			"Customizable columns and workflows",
		],
	},
];

export const additionalFeatures: AdditionalFeature[] = [
	{
		icon: Users,
		title: "Real-time Sync",
		description: "See your team's changes instantly. No refresh needed.",
	},
	{
		icon: Zap,
		title: "Lightning Fast",
		description: "Built for speed. Every interaction feels instant.",
	},
	{
		icon: Sparkles,
		title: "AI-Powered",
		description: "Smart summaries help you make decisions faster.",
	},
];

