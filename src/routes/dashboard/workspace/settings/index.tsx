import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	ArrowLeft,
	Upload,
	Trash2,
	UserPlus,
	MoreVertical,
	CreditCard,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/workspace/settings/")({
	component: RouteComponent,
});

function RouteComponent() {
	const [activeTab, setActiveTab] = useState("general");

	const tabs = [
		{ id: "general", label: "General" },
		{ id: "members", label: "Members" },
		{ id: "billing", label: "Billing" },
		{ id: "danger", label: "Danger Zone" },
	];

	const members = [
		{
			name: "John Doe",
			email: "john@example.com",
			role: "Owner",
			avatar: "/placeholder.svg",
		},
		{
			name: "Alice Smith",
			email: "alice@example.com",
			role: "Admin",
			avatar: "/placeholder.svg",
		},
		{
			name: "Bob Johnson",
			email: "bob@example.com",
			role: "Member",
			avatar: "/placeholder.svg",
		},
	];

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="border-b border-border">
				<div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
					<Link to="/dashboard">
						<Button variant="ghost" size="icon">
							<ArrowLeft className="w-5 h-5" />
						</Button>
					</Link>
					<div>
						<h1 className="text-xl font-semibold">Workspace Settings</h1>
						<p className="text-sm text-muted-foreground">
							Manage your workspace configuration
						</p>
					</div>
				</div>
			</header>

			<div className="max-w-7xl mx-auto px-6 py-8">
				<div className="flex gap-8">
					{/* Sidebar */}
					<aside className="w-56 shrink-0">
						<nav className="space-y-1">
							{tabs.map((tab) => (
								<button
									type="button"
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
										activeTab === tab.id
											? "bg-accent text-accent-foreground font-medium"
											: "text-muted-foreground hover:bg-accent/50"
									}`}
								>
									{tab.label}
								</button>
							))}
						</nav>
					</aside>

					{/* Content */}
					<div className="flex-1 max-w-3xl">
						{activeTab === "general" && (
							<div className="space-y-6">
								<div>
									<h2 className="text-lg font-semibold mb-1">General</h2>
									<p className="text-sm text-muted-foreground">
										Update your workspace name and branding
									</p>
								</div>

								<Separator />

								<div className="space-y-4">
									<div className="flex items-center gap-6">
										<div className="w-20 h-20 rounded-lg bg-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
											MW
										</div>
										<div className="space-y-2">
											<Button variant="outline" size="sm">
												<Upload className="w-4 h-4 mr-2" />
												Upload icon
											</Button>
											<p className="text-xs text-muted-foreground">
												PNG or SVG. Max size 1MB.
											</p>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="workspace-name">Workspace name</Label>
										<Input id={"workspace-name"} defaultValue="My Workspace" />
									</div>

									<div className="space-y-2">
										<Label htmlFor="workspace-description">Description</Label>
										<Textarea
											id={"workspace-description"}
											placeholder="What's this workspace about?"
											className="min-h-[100px]"
											defaultValue="Our team's central hub for collaboration and project management."
										/>
									</div>

									<div className="pt-4">
										<Button>Save changes</Button>
									</div>
								</div>
							</div>
						)}

						{activeTab === "members" && (
							<div className="space-y-6">
								<div className="flex items-center justify-between">
									<div>
										<h2 className="text-lg font-semibold mb-1">Members</h2>
										<p className="text-sm text-muted-foreground">
											Manage who has access to this workspace
										</p>
									</div>
									<Button>
										<UserPlus className="w-4 h-4 mr-2" />
										Invite member
									</Button>
								</div>

								<Separator />

								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Member</TableHead>
											<TableHead>Role</TableHead>
											<TableHead className="w-[100px]"></TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{members.map((member, idx) => (
											<TableRow key={idx}>
												<TableCell>
													<div className="flex items-center gap-3">
														<Avatar className="w-8 h-8">
															<AvatarImage
																src={member.avatar || "/placeholder.svg"}
															/>
															<AvatarFallback>{member.name[0]}</AvatarFallback>
														</Avatar>
														<div>
															<p className="font-medium text-sm">
																{member.name}
															</p>
															<p className="text-xs text-muted-foreground">
																{member.email}
															</p>
														</div>
													</div>
												</TableCell>
												<TableCell>
													<Badge variant="secondary">{member.role}</Badge>
												</TableCell>
												<TableCell>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button variant="ghost" size="icon">
																<MoreVertical className="w-4 h-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuItem>Change role</DropdownMenuItem>
															<DropdownMenuItem className="text-destructive">
																Remove member
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						)}

						{activeTab === "billing" && (
							<div className="space-y-6">
								<div>
									<h2 className="text-lg font-semibold mb-1">Billing</h2>
									<p className="text-sm text-muted-foreground">
										Manage your subscription and payment methods
									</p>
								</div>

								<Separator />

								<div className="space-y-6">
									<div className="p-6 border border-border rounded-lg">
										<div className="flex items-start justify-between mb-4">
											<div>
												<h3 className="font-semibold mb-1">Pro Plan</h3>
												<p className="text-sm text-muted-foreground">
													$12/month · Billed monthly
												</p>
											</div>
											<Badge>Active</Badge>
										</div>
										<div className="flex gap-2">
											<Button variant="outline">Change plan</Button>
											<Button variant="outline">Cancel subscription</Button>
										</div>
									</div>

									<div>
										<h3 className="font-semibold mb-4">Payment method</h3>
										<div className="p-4 border border-border rounded-lg flex items-center justify-between">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
													<CreditCard className="w-5 h-5" />
												</div>
												<div>
													<p className="font-medium text-sm">
														•••• •••• •••• 4242
													</p>
													<p className="text-xs text-muted-foreground">
														Expires 12/25
													</p>
												</div>
											</div>
											<Button variant="outline" size="sm">
												Update
											</Button>
										</div>
									</div>
								</div>
							</div>
						)}

						{activeTab === "danger" && (
							<div className="space-y-6">
								<div>
									<h2 className="text-lg font-semibold mb-1">Danger Zone</h2>
									<p className="text-sm text-muted-foreground">
										Irreversible actions for this workspace
									</p>
								</div>

								<Separator />

								<div className="space-y-4">
									<div className="p-4 border border-destructive/50 rounded-lg">
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<h3 className="font-semibold mb-1 text-destructive">
													Delete workspace
												</h3>
												<p className="text-sm text-muted-foreground">
													Once you delete a workspace, there is no going back.
													All projects, boards, and data will be permanently
													deleted.
												</p>
											</div>
											<AlertDialog>
												<AlertDialogTrigger asChild>
													<Button variant="destructive" className="ml-4">
														<Trash2 className="w-4 h-4 mr-2" />
														Delete
													</Button>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>
															Are you absolutely sure?
														</AlertDialogTitle>
														<AlertDialogDescription>
															This action cannot be undone. This will
															permanently delete your workspace and remove all
															associated data from our servers.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>Cancel</AlertDialogCancel>
														<AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
															Delete workspace
														</AlertDialogAction>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
