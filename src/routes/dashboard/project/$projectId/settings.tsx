import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
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
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
	Archive,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/dashboard/project/$projectId/settings")({
	component: RouteComponent,
});

function RouteComponent() {
	const [activeTab, setActiveTab] = useState("general");
	const [isPublic, setIsPublic] = useState(false);
	const [allowComments, setAllowComments] = useState(true);
	const [isAddingMember, setIsAddingMember] = useState(false);
	const [newMember, setNewMember] = useState({ email: "", role: "viewer" });

	const tabs = [
		{ id: "general", label: "General" },
		{ id: "members", label: "Members" },
		{ id: "permissions", label: "Permissions" },
		{ id: "archive", label: "Archive" },
	];

	const projectMembers = [
		{
			name: "John Doe",
			email: "john@example.com",
			role: "Owner",
			avatar: "/placeholder.svg",
		},
		{
			name: "Alice Smith",
			email: "alice@example.com",
			role: "Editor",
			avatar: "/placeholder.svg",
		},
		{
			name: "Bob Johnson",
			email: "bob@example.com",
			role: "Viewer",
			avatar: "/placeholder.svg",
		},
	];

	const colors = [
		{ name: "Blue", value: "bg-blue-500" },
		{ name: "Purple", value: "bg-purple-500" },
		{ name: "Green", value: "bg-green-500" },
		{ name: "Orange", value: "bg-orange-500" },
		{ name: "Red", value: "bg-red-500" },
	];

	const handleAddMember = () => {
		if (newMember.email.trim()) {
			console.log("[v0] Adding member:", newMember);
			setNewMember({ email: "", role: "viewer" });
			setIsAddingMember(false);
		}
	};

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
						<h1 className="text-xl font-semibold">Project Settings</h1>
						<p className="text-sm text-muted-foreground">
							Manage your project configuration
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
										Update your project details and appearance
									</p>
								</div>

								<Separator />

								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="project-name">Project name</Label>
										<Input
											id={"project-name"}
											defaultValue="Product Roadmap Q1"
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="project-description">Description</Label>
										<Textarea
											id={"project-description"}
											placeholder="What's this project about?"
											className="min-h-[100px]"
											defaultValue="Planning and tracking our Q1 product roadmap initiatives."
										/>
									</div>

									<div className="space-y-2">
										<Label>Project color</Label>
										<div className="flex gap-2">
											{colors.map((color) => (
												<button
													type="button"
													key={color.value}
													className={`w-10 h-10 rounded-lg ${color.value} hover:ring-2 ring-offset-2 ring-primary transition-all`}
													title={color.name}
												/>
											))}
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="project-icon">Project icon</Label>
										<div className="flex items-center gap-4">
											<div className="w-16 h-16 rounded-lg bg-primary flex items-center justify-center text-2xl">
												📋
											</div>
											<Button variant="outline" size="sm">
												<Upload className="w-4 h-4 mr-2" />
												Change icon
											</Button>
										</div>
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
											Manage who can access this project
										</p>
									</div>
									<Dialog
										open={isAddingMember}
										onOpenChange={setIsAddingMember}
									>
										<DialogTrigger asChild>
											<Button>
												<UserPlus className="w-4 h-4 mr-2" />
												Add member
											</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Add project member</DialogTitle>
												<DialogDescription>
													Invite someone to collaborate on this project
												</DialogDescription>
											</DialogHeader>
											<div className="space-y-4 pt-4">
												<div className="space-y-2">
													<Label htmlFor="member-email">Email address</Label>
													<Input
														id={"member-email"}
														type="email"
														placeholder="colleague@example.com"
														value={newMember.email}
														onChange={(e) =>
															setNewMember({
																...newMember,
																email: e.target.value,
															})
														}
													/>
												</div>
												<div className="space-y-2">
													<Label htmlFor="member-role">Role</Label>
													<Select
														value={newMember.role}
														onValueChange={(value) =>
															setNewMember({ ...newMember, role: value })
														}
													>
														<SelectTrigger id={"member-role"}>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="owner">
																Owner - Full control
															</SelectItem>
															<SelectItem value="editor">
																Editor - Can edit and comment
															</SelectItem>
															<SelectItem value="viewer">
																Viewer - Can only view
															</SelectItem>
														</SelectContent>
													</Select>
												</div>
												<div className="flex justify-end gap-2 pt-4">
													<Button
														variant="outline"
														onClick={() => setIsAddingMember(false)}
													>
														Cancel
													</Button>
													<Button onClick={handleAddMember}>
														Send invitation
													</Button>
												</div>
											</div>
										</DialogContent>
									</Dialog>
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
										{projectMembers.map((member, idx) => (
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
													<Select defaultValue={member.role.toLowerCase()}>
														<SelectTrigger className="w-32">
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="owner">Owner</SelectItem>
															<SelectItem value="editor">Editor</SelectItem>
															<SelectItem value="viewer">Viewer</SelectItem>
														</SelectContent>
													</Select>
												</TableCell>
												<TableCell>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button variant="ghost" size="icon">
																<MoreVertical className="w-4 h-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuItem className="text-destructive">
																Remove from project
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

						{activeTab === "permissions" && (
							<div className="space-y-6">
								<div>
									<h2 className="text-lg font-semibold mb-1">Permissions</h2>
									<p className="text-sm text-muted-foreground">
										Control access and visibility settings
									</p>
								</div>

								<Separator />

								<div className="space-y-6">
									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<Label htmlFor="public-access">Public access</Label>
											<p className="text-sm text-muted-foreground">
												Anyone with the link can view this project
											</p>
										</div>
										<Switch
											id={"public-access"}
											checked={isPublic}
											onCheckedChange={setIsPublic}
										/>
									</div>

									<Separator />

									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<Label htmlFor="allow-comments">Allow comments</Label>
											<p className="text-sm text-muted-foreground">
												Team members can leave comments on boards
											</p>
										</div>
										<Switch
											id={"allow-comments"}
											checked={allowComments}
											onCheckedChange={setAllowComments}
										/>
									</div>

									<Separator />

									<div className="space-y-2">
										<Label>Default board access</Label>
										<Select defaultValue="editor">
											<SelectTrigger className="w-full">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="owner">
													Owner - Full control
												</SelectItem>
												<SelectItem value="editor">
													Editor - Can edit and comment
												</SelectItem>
												<SelectItem value="viewer">
													Viewer - Can only view
												</SelectItem>
											</SelectContent>
										</Select>
										<p className="text-xs text-muted-foreground">
											Default permission level for new project members
										</p>
									</div>
								</div>
							</div>
						)}

						{activeTab === "archive" && (
							<div className="space-y-6">
								<div>
									<h2 className="text-lg font-semibold mb-1">Archive</h2>
									<p className="text-sm text-muted-foreground">
										Archive or delete this project
									</p>
								</div>

								<Separator />

								<div className="space-y-4">
									<div className="p-4 border border-border rounded-lg">
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<h3 className="font-semibold mb-1">Archive project</h3>
												<p className="text-sm text-muted-foreground">
													Archive this project to hide it from your workspace.
													You can restore it later.
												</p>
											</div>
											<Button variant="outline" className="ml-4 bg-transparent">
												<Archive className="w-4 h-4 mr-2" />
												Archive
											</Button>
										</div>
									</div>

									<div className="p-4 border border-destructive/50 rounded-lg">
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<h3 className="font-semibold mb-1 text-destructive">
													Delete project
												</h3>
												<p className="text-sm text-muted-foreground">
													Once you delete a project, there is no going back. All
													boards and data will be permanently deleted.
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
															permanently delete your project and remove all
															associated boards and data from our servers.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>Cancel</AlertDialogCancel>
														<AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
															Delete project
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
