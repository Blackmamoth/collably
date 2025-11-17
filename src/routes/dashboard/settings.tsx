import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Upload } from "lucide-react";
import { RiGithubLine, RiGoogleFill } from "react-icons/ri";

const tabs = [
	{ id: "profile", label: "Profile" },
	{ id: "account", label: "Account" },
	{ id: "notifications", label: "Notifications" },
	{ id: "preferences", label: "Preferences" },
] as const;

export const Route = createFileRoute("/dashboard/settings")({
	component: RouteComponent,
});

function RouteComponent() {
	const [activeTab, setActiveTab] = useState("profile");

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
						<h1 className="text-xl font-semibold">Settings</h1>
						<p className="text-sm text-muted-foreground">
							Manage your account settings and preferences
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
					<div className="flex-1 max-w-2xl">
						{activeTab === "profile" && (
							<div className="space-y-6">
								<div>
									<h2 className="text-lg font-semibold mb-1">Profile</h2>
									<p className="text-sm text-muted-foreground">
										Update your personal information and profile picture
									</p>
								</div>

								<Separator />

								<div className="space-y-4">
									<div className="flex items-center gap-6">
										<Avatar className="w-20 h-20">
											<AvatarImage src="/placeholder.svg?height=80&width=80" />
											<AvatarFallback>JD</AvatarFallback>
										</Avatar>
										<div className="space-y-2">
											<Button variant="outline" size="sm">
												<Upload className="w-4 h-4 mr-2" />
												Upload photo
											</Button>
											<p className="text-xs text-muted-foreground">
												JPG, PNG or GIF. Max size 2MB.
											</p>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="name">Full name</Label>
										<Input id={"name"} defaultValue="John Doe" />
									</div>

									<div className="space-y-2">
										<Label htmlFor="bio">Bio</Label>
										<Textarea
											id={"bio"}
											placeholder="Tell us about yourself"
											className="min-h-[100px]"
											defaultValue="Product designer and developer passionate about creating beautiful user experiences."
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="timezone">Timezone</Label>
										<Select defaultValue="utc-8">
											<SelectTrigger id={"timezone"}>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="utc-8">
													Pacific Time (UTC-8)
												</SelectItem>
												<SelectItem value="utc-5">
													Eastern Time (UTC-5)
												</SelectItem>
												<SelectItem value="utc+0">UTC</SelectItem>
												<SelectItem value="utc+1">
													Central European Time (UTC+1)
												</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="pt-4">
										<Button>Save changes</Button>
									</div>
								</div>
							</div>
						)}

						{activeTab === "account" && (
							<div className="space-y-6">
								<div>
									<h2 className="text-lg font-semibold mb-1">Account</h2>
									<p className="text-sm text-muted-foreground">
										Manage your account security and connected services
									</p>
								</div>

								<Separator />

								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="email">Email</Label>
										<Input
											id={"email"}
											type="email"
											defaultValue="john@example.com"
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="current-password">Current password</Label>
										<Input id={"current-password"} type="password" />
									</div>

									<div className="space-y-2">
										<Label htmlFor="new-password">New password</Label>
										<Input id={"new-password"} type="password" />
									</div>

									<div className="space-y-2">
										<Label htmlFor="confirm-password">
											Confirm new password
										</Label>
										<Input id={"confirm-password"} type="password" />
									</div>

									<div className="pt-4">
										<Button>Update password</Button>
									</div>
								</div>

								<Separator />

								<div className="space-y-4">
									<h3 className="font-semibold">Connected accounts</h3>
									<div className="space-y-3">
										<div className="flex items-center justify-between p-4 border border-border rounded-lg">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
													<RiGoogleFill className="w-4 h-4" />
												</div>
												<div>
													<p className="font-medium text-sm">Google</p>
													<p className="text-xs text-muted-foreground">
														john@gmail.com
													</p>
												</div>
											</div>
											<Badge variant="secondary">Connected</Badge>
										</div>

										<div className="flex items-center justify-between p-4 border border-border rounded-lg">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
													<RiGithubLine className="w-4 h-4" />
												</div>
												<div>
													<p className="font-medium text-sm">GitHub</p>
													<p className="text-xs text-muted-foreground">
														Not connected
													</p>
												</div>
											</div>
											<Button variant="outline" size="sm">
												Connect
											</Button>
										</div>
									</div>
								</div>
							</div>
						)}

						{activeTab === "notifications" && (
							<div className="space-y-6">
								<div>
									<h2 className="text-lg font-semibold mb-1">Notifications</h2>
									<p className="text-sm text-muted-foreground">
										Configure how you receive notifications
									</p>
								</div>

								<Separator />

								<div className="space-y-6">
									<div className="space-y-4">
										<h3 className="font-semibold">Email notifications</h3>
										<div className="space-y-4">
											<div className="flex items-center justify-between">
												<div className="space-y-0.5">
													<Label>Task assignments</Label>
													<p className="text-sm text-muted-foreground">
														Get notified when you're assigned to a task
													</p>
												</div>
												<Switch defaultChecked />
											</div>

											<div className="flex items-center justify-between">
												<div className="space-y-0.5">
													<Label>Comments and mentions</Label>
													<p className="text-sm text-muted-foreground">
														Get notified when someone mentions you
													</p>
												</div>
												<Switch defaultChecked />
											</div>

											<div className="flex items-center justify-between">
												<div className="space-y-0.5">
													<Label>Project updates</Label>
													<p className="text-sm text-muted-foreground">
														Get notified about project changes
													</p>
												</div>
												<Switch />
											</div>

											<div className="flex items-center justify-between">
												<div className="space-y-0.5">
													<Label>Weekly summary</Label>
													<p className="text-sm text-muted-foreground">
														Receive a weekly summary of your activity
													</p>
												</div>
												<Switch defaultChecked />
											</div>
										</div>
									</div>

									<Separator />

									<div className="space-y-4">
										<h3 className="font-semibold">Push notifications</h3>
										<div className="space-y-4">
											<div className="flex items-center justify-between">
												<div className="space-y-0.5">
													<Label>Real-time updates</Label>
													<p className="text-sm text-muted-foreground">
														Get instant notifications for important updates
													</p>
												</div>
												<Switch defaultChecked />
											</div>

											<div className="flex items-center justify-between">
												<div className="space-y-0.5">
													<Label>Due date reminders</Label>
													<p className="text-sm text-muted-foreground">
														Get reminded about upcoming due dates
													</p>
												</div>
												<Switch defaultChecked />
											</div>
										</div>
									</div>
								</div>
							</div>
						)}

						{activeTab === "preferences" && (
							<div className="space-y-6">
								<div>
									<h2 className="text-lg font-semibold mb-1">Preferences</h2>
									<p className="text-sm text-muted-foreground">
										Customize your Collably experience
									</p>
								</div>

								<Separator />

								<div className="space-y-6">
									<div className="space-y-4">
										<h3 className="font-semibold">Appearance</h3>
										<div className="space-y-2">
											<Label htmlFor="theme">Theme</Label>
											<Select defaultValue="dark">
												<SelectTrigger id={"theme"}>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="light">Light</SelectItem>
													<SelectItem value="dark">Dark</SelectItem>
													<SelectItem value="system">System</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>

									<Separator />

									<div className="space-y-4">
										<h3 className="font-semibold">Language & Region</h3>
										<div className="space-y-2">
											<Label htmlFor="language">Language</Label>
											<Select defaultValue="en">
												<SelectTrigger id={"language"}>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="en">English</SelectItem>
													<SelectItem value="es">Spanish</SelectItem>
													<SelectItem value="fr">French</SelectItem>
													<SelectItem value="de">German</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>

									<Separator />

									<div className="space-y-4">
										<h3 className="font-semibold">Advanced</h3>
										<div className="space-y-4">
											<div className="flex items-center justify-between">
												<div className="space-y-0.5">
													<Label>Keyboard shortcuts</Label>
													<p className="text-sm text-muted-foreground">
														Enable keyboard shortcuts for faster navigation
													</p>
												</div>
												<Switch defaultChecked />
											</div>

											<div className="flex items-center justify-between">
												<div className="space-y-0.5">
													<Label>Auto-save</Label>
													<p className="text-sm text-muted-foreground">
														Automatically save changes as you work
													</p>
												</div>
												<Switch defaultChecked />
											</div>
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
