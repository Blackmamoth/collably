import { Layers } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface LogoProps {
	size?: "sm" | "md" | "lg";
	showText?: boolean;
	className?: string;
}

export function Logo({ size = "md", showText = true, className }: LogoProps) {
	const sizeClasses = {
		sm: { icon: "w-6 h-6", container: "w-8 h-8", text: "text-lg" },
		md: { icon: "w-5 h-5", container: "w-8 h-8", text: "text-xl" },
		lg: { icon: "w-6 h-6", container: "w-10 h-10", text: "text-2xl" },
	};

	const classes = sizeClasses[size];

	return (
		<Link
			to="/"
			className={`flex items-center gap-2 ${className || ""}`}
		>
			<div
				className={`${classes.container} bg-primary rounded-lg flex items-center justify-center`}
			>
				<Layers className={`${classes.icon} text-primary-foreground`} />
			</div>
			{showText && (
				<span className={`${classes.text} font-semibold tracking-tight`}>
					Collably
				</span>
			)}
		</Link>
	);
}

