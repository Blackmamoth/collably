import {
	createFileRoute,
	Link,
	redirect,
	useNavigate,
	useParams,
} from "@tanstack/react-router";
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
import { ArrowLeft, Upload, Trash2, Archive, Users } from "lucide-react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import type { Id } from "convex/_generated/dataModel";
import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import { ConvexError } from "convex/values";
import { toast } from "sonner";

const schema = z.object({
	name: z.string().min(1, "name is required"),
	description: z.string().or(z.literal("")),
});

export const Route = createFileRoute("/dashboard/project/$projectId/settings")({
	component: RouteComponent,
	beforeLoad: async ({ context, params }) => {
		const { user } = context;

		if (user === undefined) {
			throw redirect({ to: "/login" });
		}
		const { projectId } = params;

		try {
			await context.convexClient.query(api.project.getProject, {
				projectId: projectId as Id<"project">,
			});
			return { user };
		} catch (error) {
			throw redirect({ to: "/dashboard" });
		}
	},
});

function RouteComponent() {
	const [activeTab, setActiveTab] = useState("general");
	const [isPublic, setIsPublic] = useState(false);
	const [allowComments, setAllowComments] = useState(true);
	const [isSaving, setIsSaving] = useState(false);

	const tabs = [
		{ id: "general", label: "General" },
		{ id: "members", label: "Members" },
		{ id: "permissions", label: "Permissions" },
		{ id: "archive", label: "Archive" },
	];

	const { projectId } = useParams({ from: Route.id });

	const workspaceMembers = useQuery(api.workspace.getWorkspaceMembers);
	const navigate = useNavigate();
	const project = useQuery(api.project.getProject, {
		projectId: projectId as Id<"project">,
	});

	const updateProject = useMutation(api.project.updateProject);
	const deleteProject = useAction(api.project.deleteProject);

	const onDeleteProject = async () => {
		try {
			await deleteProject({ projectId: projectId as Id<"project"> });
			navigate({ to: "/dashboard" });
		} catch (error) {
			if (error instanceof ConvexError) {
				toast.error(error.data);
			}
		}
	};

	const form = useForm({
		defaultValues: {
			name: project?.name || "",
			description: project?.description || "",
		},
		validators: {
			onChange: schema,
		},
		onSubmit: async ({ value }) => {
			try {
				setIsSaving(true);
				await updateProject({
					...value,
					projectId: projectId as Id<"project">,
				});
			} catch (error) {
				if (error instanceof ConvexError) {
					toast.error(error.data);
				}
			} finally {
				setIsSaving(false);
			}
		},
	});

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

								<form
									onSubmit={(e) => {
										e.preventDefault();
										e.stopPropagation();
										form.handleSubmit();
									}}
								>
									<div className="space-y-4">
										<form.Field name="name">
											{(field) => (
												<div className="space-y-2">
													<Label htmlFor="project-name">Project name</Label>
													<Input
														id={"project-name"}
														value={field.state.value}
														onChange={(e) => field.handleChange(e.target.value)}
													/>
												</div>
											)}
										</form.Field>

										<form.Field name="description">
											{(field) => (
												<div className="space-y-2">
													<Label htmlFor="project-description">
														Description
													</Label>
													<Textarea
														id={"project-description"}
														placeholder="What's this project about?"
														className="min-h-[100px]"
														value={field.state.value}
														onChange={(e) => field.handleChange(e.target.value)}
													/>
												</div>
											)}
										</form.Field>

										<div className="pt-4">
											<Button disabled={isSaving}>Save changes</Button>
										</div>
									</div>
								</form>
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
									<Button onClick={() => navigate({ to: "/dashboard/team" })}>
										<Users className="w-4 h-4 mr-2" />
										Manage members
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
										{workspaceMembers?.members?.map((member) => (
											<TableRow key={member.id}>
												<TableCell>
													<div className="flex items-center gap-3">
														<Avatar className="w-8 h-8">
															<AvatarImage
																src={member.user.image || "/placeholder.svg"}
															/>
															<AvatarFallback>
																{member.user.name[0]}
															</AvatarFallback>
														</Avatar>
														<div>
															<p className="font-medium text-sm">
																{member.user.name}
															</p>
															<p className="text-xs text-muted-foreground">
																{member.user.email}
															</p>
														</div>
													</div>
												</TableCell>
												<TableCell>
													{" "}
													<Badge variant="secondary">{member.role}</Badge>
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
														<AlertDialogAction
															onClick={onDeleteProject}
															className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
														>
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
