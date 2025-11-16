import { createFileRoute, Link, useRouteContext } from "@tanstack/react-router";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { RiTwitterXFill, RiGithubLine } from "react-icons/ri";
import { Logo } from "@/components/landing/logo";
import { PricingCard } from "@/components/landing/pricing-card";
import { FeatureCard } from "@/components/landing/feature-card";
import { AdditionalFeatureCard } from "@/components/landing/additional-feature-card";
import {
	pricingPlans,
	mainFeatures,
	additionalFeatures,
} from "@/lib/landing-data";

export const Route = createFileRoute("/")({ component: App });

function App() {
	const { user } = useRouteContext({ from: Route.id });
	const isLoggedIn = user !== undefined;

	const firstName = useMemo(() => {
		return user?.name ? user.name.split(" ")[0] : "";
	}, [user?.name]);
	return (
		<div className="min-h-screen bg-background">
			{/* Navigation */}
			<nav className="fixed top-0 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl z-50">
				<div className="max-w-7xl mx-auto px-6 lg:px-8">
					<div className="flex items-center justify-between h-16">
						<Logo size="md" />
						<div className="hidden md:flex items-center gap-8">
							<Link
								to="/"
								hash="features"
								className="text-sm text-muted-foreground hover:text-foreground transition-colors"
							>
								Features
							</Link>
							<Link
								to="/"
								hash="pricing"
								className="text-sm text-muted-foreground hover:text-foreground transition-colors"
							>
								Pricing
							</Link>
							<a
								href="https://github.com/blackmamoth/collably"
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
							>
								<RiGithubLine className="w-4 h-4" />
								<span>Star on GitHub</span>
								<Badge variant="secondary" className="ml-1">
									<Star className="w-3 h-3 mr-1 fill-current" />
									1.2k
								</Badge>
							</a>
							<ThemeToggle />
							{!isLoggedIn && (
								<Link
									to="/login"
									className="text-sm text-muted-foreground hover:text-foreground transition-colors"
								>
									Sign in
								</Link>
							)}
							<Button size="sm" asChild>
								<Link to={isLoggedIn ? "/dashboard" : "/signup"}>
									{isLoggedIn ? "Go to Dashboard" : "Get Started"}
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<section className="pt-32 pb-20 px-6 lg:px-8">
				<div className="max-w-7xl mx-auto">
					<div className="max-w-3xl mx-auto text-center">
						<Badge variant="secondary" className="mb-6 px-4 py-1.5">
							<Sparkles className="w-3.5 h-3.5 mr-1.5" />
							Open Source Collaboration Platform
						</Badge>
						{isLoggedIn ? (
							<>
								<h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-balance">
									Welcome back
									{firstName && (
										<>
											<br />
											<span className="text-muted-foreground">
												{firstName}!
											</span>
										</>
									)}
								</h1>
								<p className="text-xl text-muted-foreground mb-10 leading-relaxed text-balance max-w-2xl mx-auto">
									Ready to continue collaborating? Jump back into your workspace
									and keep your team moving forward.
								</p>
							</>
						) : (
							<>
								<h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-balance">
									Transform Team
									<br />
									<span className="text-muted-foreground">Collaboration</span>
								</h1>
								<p className="text-xl text-muted-foreground mb-10 leading-relaxed text-balance max-w-2xl mx-auto">
									Real-time brainstorming and task management in one elegant
									workspace. Designed for teams that move fast.
								</p>
							</>
						)}
						<div className="flex items-center justify-center gap-4">
							<Button size="lg" className="h-12 px-8" asChild>
								<Link to={isLoggedIn ? "/dashboard" : "/signup"}>
									{isLoggedIn ? "Go to Dashboard" : "Get Started Free"}
									<ArrowRight className="w-4 h-4 ml-2" />
								</Link>
							</Button>
						</div>
						{!isLoggedIn && (
							<p className="text-sm text-muted-foreground mt-6">
								No credit card required · Free forever for small teams
							</p>
						)}
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section id={"features"} className="py-20 px-6 lg:px-8">
				<div className="max-w-7xl mx-auto">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
							Everything you need to collaborate
						</h2>
						<p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
							Two powerful boards, one seamless experience
						</p>
					</div>

					<div className="grid md:grid-cols-2 gap-6 mb-6">
						{mainFeatures.map((feature) => (
							<FeatureCard key={feature.title} feature={feature} />
						))}
					</div>

					{/* Additional Features */}
					<div className="grid md:grid-cols-3 gap-6">
						{additionalFeatures.map((feature) => (
							<AdditionalFeatureCard key={feature.title} feature={feature} />
						))}
					</div>
				</div>
			</section>

			{/* Pricing Section */}
			<section id={"pricing"} className="py-20 px-6 lg:px-8">
				<div className="max-w-7xl mx-auto">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
							Simple, transparent pricing
						</h2>
						<p className="text-lg text-muted-foreground text-balance">
							Start free, scale as you grow
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
						{pricingPlans.map((plan) => (
							<PricingCard key={plan.id} plan={plan} isLoggedIn={isLoggedIn} />
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 px-6 lg:px-8">
				<div className="max-w-4xl mx-auto">
					<Card className="p-12 bg-card border-border text-center">
						<h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
							{isLoggedIn
								? "Ready to continue your work?"
								: "Ready to transform your workflow?"}
						</h2>
						<p className="text-lg text-muted-foreground mb-8 text-balance max-w-2xl mx-auto">
							{isLoggedIn
								? "Jump back into your dashboard and keep collaborating"
								: "Join teams already collaborating better with Collably"}
						</p>
						<Button size="lg" className="h-12 px-8" asChild>
							<Link to={isLoggedIn ? "/dashboard" : "/signup"}>
								{isLoggedIn ? "Go to Dashboard" : "Get Started Free"}
								<ArrowRight className="w-4 h-4 ml-2" />
							</Link>
						</Button>
					</Card>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-border py-8 px-6 lg:px-8">
				<div className="max-w-7xl mx-auto">
					<div className="flex flex-col md:flex-row items-center justify-between gap-6">
						<Logo size="sm" />

						<div className="flex items-center gap-6">
							<Link
								to="/"
								hash="features"
								className="text-sm text-muted-foreground hover:text-foreground transition-colors"
							>
								Features
							</Link>
							<Link
								to="/"
								hash="pricing"
								className="text-sm text-muted-foreground hover:text-foreground transition-colors"
							>
								Pricing
							</Link>
							<a
								href="https://github.com/blackmamoth/collably"
								target="_blank"
								rel="noopener noreferrer"
								className="text-sm text-muted-foreground hover:text-foreground transition-colors"
							>
								Docs
							</a>
						</div>

						<div className="flex items-center gap-4">
							<a
								href="https://github.com/blackmamoth/collably"
								target="_blank"
								rel="noopener noreferrer"
								className="text-muted-foreground hover:text-foreground transition-colors"
							>
								<RiGithubLine className="w-4 h-4" />
							</a>
							<a
								href="https://x.com/AshpakVeetar"
								target="_blank"
								rel="noopener noreferrer"
								className="text-muted-foreground hover:text-foreground transition-colors"
							>
								<RiTwitterXFill className="w-4 h-4" />
							</a>
						</div>
					</div>

					<div className="mt-6 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
						<p className="text-sm text-muted-foreground">
							© 2025 Collably. Open source under MIT License.
						</p>
						<div className="flex items-center gap-6">
							<Link
								to="."
								className="text-sm text-muted-foreground hover:text-foreground transition-colors"
							>
								Privacy
							</Link>
							<Link
								to="."
								className="text-sm text-muted-foreground hover:text-foreground transition-colors"
							>
								Terms
							</Link>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
