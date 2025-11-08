import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Bell, ChevronDown } from "lucide-react";
import { Input } from "../ui/input";
import { ThemeToggle } from "../theme-toggle";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "@tanstack/react-router";

interface Props {
	name: string;
	image?: string | null;
}

export default function DashboardTopNavigation({ name, image }: Props) {
	return (
		<header className="h-14 border-b border-border flex items-center justify-between px-6">
			<div className="flex items-center gap-4 flex-1 max-w-xl">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					<Input
						placeholder="Search projects, tasks..."
						className="pl-9 h-9 bg-background"
					/>
				</div>
			</div>

			<div className="flex items-center gap-3">
				<ThemeToggle />

				<Button variant="ghost" size="icon" className="relative">
					<Bell className="w-5 h-5" />
					<span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
				</Button>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="gap-2 h-9 px-2">
							<Avatar className="w-6 h-6">
								<AvatarImage src={image ?? ""} />
								<AvatarFallback>
									{name.split(" ").map((c) => c[0].toUpperCase())}
								</AvatarFallback>
							</Avatar>
							<span className="text-sm">{name}</span>
							<ChevronDown className="w-4 h-4 text-muted-foreground" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-56">
						<DropdownMenuLabel>My Account</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem asChild>
							<Link to="/dashboard/settings" className="cursor-pointer">
								Profile
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link to="/dashboard/settings" className="cursor-pointer">
								Settings
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link
								to="/dashboard/workspace/settings"
								className="cursor-pointer"
							>
								Workspace Settings
							</Link>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem asChild>
							<Link to="/login" className="cursor-pointer">
								Log out
							</Link>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
}
