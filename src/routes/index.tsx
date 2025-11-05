import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	ArrowRight,
	Sparkles,
	Users,
	Zap,
	CheckCircle2,
	Layers,
	Kanban,
	Star,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { RiTwitterXFill, RiGithubLine } from "react-icons/ri";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return (
		<div className="min-h-screen bg-background">
			{/* Navigation */}
			<nav className="fixed top-0 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl z-50">
				<div className="max-w-7xl mx-auto px-6 lg:px-8">
					<div className="flex items-center justify-between h-16">
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
								<Layers className="w-5 h-5 text-primary-foreground" />
							</div>
							<span className="text-xl font-semibold tracking-tight">
								Collably
							</span>
						</div>
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
							<Link
								to="/login"
								className="text-sm text-muted-foreground hover:text-foreground transition-colors"
							>
								Sign in
							</Link>
							<Button size="sm" asChild>
								<Link to="/signup">Get Started</Link>
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
						<h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-balance">
							Transform Team
							<br />
							<span className="text-muted-foreground">Collaboration</span>
						</h1>
						<p className="text-xl text-muted-foreground mb-10 leading-relaxed text-balance max-w-2xl mx-auto">
							Real-time brainstorming and task management in one elegant
							workspace. Designed for teams that move fast.
						</p>
						<div className="flex items-center justify-center gap-4">
							<Button size="lg" className="h-12 px-8" asChild>
								<Link to="/signup">
									Get Started Free
									<ArrowRight className="w-4 h-4 ml-2" />
								</Link>
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="h-12 px-8 bg-transparent"
								asChild
							>
								<Link to=".">View Demo</Link>
							</Button>
						</div>
						<p className="text-sm text-muted-foreground mt-6">
							No credit card required · Free forever for small teams
						</p>
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
						{/* Decision Board Feature */}
						<Card className="p-8 bg-card border-border hover:border-muted-foreground/20 transition-colors">
							<div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
								<Layers className="w-6 h-6 text-primary" />
							</div>
							<h3 className="text-2xl font-semibold mb-3">Decision Board</h3>
							<p className="text-muted-foreground leading-relaxed mb-6">
								Brainstorm with colorful sticky notes. Drag, drop, and organize
								ideas in real-time. AI-powered summaries help distill insights
								instantly.
							</p>
							<ul className="space-y-3">
								<li className="flex items-start gap-3">
									<CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
									<span className="text-sm text-muted-foreground">
										Real-time collaboration with live cursors
									</span>
								</li>
								<li className="flex items-start gap-3">
									<CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
									<span className="text-sm text-muted-foreground">
										AI-generated summaries and insights
									</span>
								</li>
								<li className="flex items-start gap-3">
									<CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
									<span className="text-sm text-muted-foreground">
										Color-coded sticky notes for organization
									</span>
								</li>
							</ul>
						</Card>

						{/* Task Board Feature */}
						<Card className="p-8 bg-card border-border hover:border-muted-foreground/20 transition-colors">
							<div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
								<Kanban className="w-6 h-6 text-primary" />
							</div>
							<h3 className="text-2xl font-semibold mb-3">Task Board</h3>
							<p className="text-muted-foreground leading-relaxed mb-6">
								Kanban-style task management that keeps your team aligned. Drag
								tasks across columns and track progress effortlessly.
							</p>
							<ul className="space-y-3">
								<li className="flex items-start gap-3">
									<CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
									<span className="text-sm text-muted-foreground">
										Intuitive drag-and-drop interface
									</span>
								</li>
								<li className="flex items-start gap-3">
									<CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
									<span className="text-sm text-muted-foreground">
										Assignees, due dates, and priority tags
									</span>
								</li>
								<li className="flex items-start gap-3">
									<CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
									<span className="text-sm text-muted-foreground">
										Customizable columns and workflows
									</span>
								</li>
							</ul>
						</Card>
					</div>

					{/* Additional Features */}
					<div className="grid md:grid-cols-3 gap-6">
						<Card className="p-6 bg-card border-border">
							<Users className="w-8 h-8 text-primary mb-4" />
							<h4 className="font-semibold mb-2">Real-time Sync</h4>
							<p className="text-sm text-muted-foreground leading-relaxed">
								See your team's changes instantly. No refresh needed.
							</p>
						</Card>
						<Card className="p-6 bg-card border-border">
							<Zap className="w-8 h-8 text-primary mb-4" />
							<h4 className="font-semibold mb-2">Lightning Fast</h4>
							<p className="text-sm text-muted-foreground leading-relaxed">
								Built for speed. Every interaction feels instant.
							</p>
						</Card>
						<Card className="p-6 bg-card border-border">
							<Sparkles className="w-8 h-8 text-primary mb-4" />
							<h4 className="font-semibold mb-2">AI-Powered</h4>
							<p className="text-sm text-muted-foreground leading-relaxed">
								Smart summaries help you make decisions faster.
							</p>
						</Card>
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
						{/* Free Tier */}
						<Card className="p-8 bg-card border-border transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-primary/50">
							<div className="mb-6">
								<h3 className="text-xl font-semibold mb-2">Free</h3>
								<div className="flex items-baseline gap-1 mb-4">
									<span className="text-4xl font-bold">$0</span>
									<span className="text-muted-foreground">/month</span>
								</div>
								<p className="text-sm text-muted-foreground">
									Perfect for small teams
								</p>
							</div>
							<Button
								variant="outline"
								className="w-full mb-6 bg-transparent"
								asChild
							>
								<Link to="/signup">Get Started</Link>
							</Button>
							<ul className="space-y-3">
								<li className="flex items-start gap-3">
									<CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
									<span className="text-sm">Up to 5 team members</span>
								</li>
								<li className="flex items-start gap-3">
									<CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
									<span className="text-sm">Unlimited boards</span>
								</li>
								<li className="flex items-start gap-3">
									<CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
									<span className="text-sm">Basic AI summaries</span>
								</li>
							</ul>
						</Card>

						{/* Pro Tier */}
						<Card className="p-8 bg-card border-primary relative transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20">
							<Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
								Most Popular
							</Badge>
							<div className="mb-6">
								<h3 className="text-xl font-semibold mb-2">Pro</h3>
								<div className="flex items-baseline gap-1 mb-4">
									<span className="text-4xl font-bold">$12</span>
									<span className="text-muted-foreground">/month</span>
								</div>
								<p className="text-sm text-muted-foreground">
									For growing teams
								</p>
							</div>
							<Button className="w-full mb-6" asChild>
								<Link to="/signup">Get Started</Link>
							</Button>
							<ul className="space-y-3">
								<li className="flex items-start gap-3">
									<CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
									<span className="text-sm">Up to 50 team members</span>
								</li>
								<li className="flex items-start gap-3">
									<CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
									<span className="text-sm">Unlimited boards</span>
								</li>
								<li className="flex items-start gap-3">
									<CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
									<span className="text-sm">Advanced AI features</span>
								</li>
								<li className="flex items-start gap-3">
									<CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
									<span className="text-sm">Priority support</span>
								</li>
							</ul>
						</Card>

						{/* Enterprise Tier */}
						<Card className="p-8 bg-card border-border transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-primary/50">
							<div className="mb-6">
								<h3 className="text-xl font-semibold mb-2">Enterprise</h3>
								<div className="flex items-baseline gap-1 mb-4">
									<span className="text-4xl font-bold">Custom</span>
								</div>
								<p className="text-sm text-muted-foreground">
									For large organizations
								</p>
							</div>
							<Button
								variant="outline"
								className="w-full mb-6 bg-transparent"
								asChild
							>
								<Link to="/signup">Contact Sales</Link>
							</Button>
							<ul className="space-y-3">
								<li className="flex items-start gap-3">
									<CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
									<span className="text-sm">Unlimited team members</span>
								</li>
								<li className="flex items-start gap-3">
									<CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
									<span className="text-sm">Custom integrations</span>
								</li>
								<li className="flex items-start gap-3">
									<CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
									<span className="text-sm">Dedicated support</span>
								</li>
								<li className="flex items-start gap-3">
									<CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
									<span className="text-sm">SLA guarantee</span>
								</li>
							</ul>
						</Card>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 px-6 lg:px-8">
				<div className="max-w-4xl mx-auto">
					<Card className="p-12 bg-card border-border text-center">
						<h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
							Ready to transform your workflow?
						</h2>
						<p className="text-lg text-muted-foreground mb-8 text-balance max-w-2xl mx-auto">
							Join teams already collaborating better with Collably
						</p>
						<Button size="lg" className="h-12 px-8" asChild>
							<Link to="/signup">
								Get Started Free
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
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
								<Layers className="w-5 h-5 text-primary-foreground" />
							</div>
							<span className="text-lg font-semibold">Collably</span>
						</div>

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
