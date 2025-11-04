import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
	return (
		<div className="min-h-screen bg-background flex items-center justify-center px-6">
			<div className="max-w-md text-center">
				<div className="mb-8">
					<h1 className="text-9xl font-bold text-muted-foreground/20">404</h1>
				</div>
				<h2 className="text-3xl font-bold mb-4">Page not found</h2>
				<p className="text-muted-foreground mb-8 leading-relaxed">
					The page you're looking for doesn't exist or has been moved. Let's get
					you back on track.
				</p>
				<div className="flex items-center justify-center gap-4">
					<Button variant="outline" onClick={() => window.history.back()}>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Go Back
					</Button>
					<Button asChild>
						<Link to="/dashboard">
							<Home className="w-4 h-4 mr-2" />
							Go to Dashboard
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
