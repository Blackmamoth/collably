import { useForm } from "@tanstack/react-form";
import {
	createFileRoute,
	Link,
	redirect,
	useNavigate,
} from "@tanstack/react-router";
import { useCustomer } from "autumn-js/react";
import { api } from "convex/_generated/api";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import {
	ArrowLeft,
	Download,
	ExternalLink,
	Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { NoWorkspacesEmpty } from "@/components/empty-states";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { authClient } from "@/lib/auth-client";
import { useWorkspace } from "@/lib/workspace-context";

const schema = z.object({
	workspaceName: z.string().min(1, "name is required"),
	workspaceSlug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
		message:
			"Slug must be a lowercase string with alphanumeric characters and hyphens",
	}),
});

const tabs = [
	{ id: "general", label: "General" },
	{ id: "members", label: "Members" },
	{ id: "billing", label: "Billing" },
	{ id: "danger", label: "Danger Zone" },
] as const;

const plans = {
	free: {
		price: "$0",
		billingCycle: "monthly",
	},
	pro: {
		price: "$12",
		billingCycle: "monthly",
	},
} as const;

export const Route = createFileRoute("/dashboard/workspace/settings/")({
	component: RouteComponent,
	beforeLoad: ({ context }) => {
		const { user } = context;

		if (user === undefined) {
			throw redirect({ to: "/login" });
		}

		return { user };
	},
});

function RouteComponent() {
	const [activeTab, setActiveTab] = useState("general");
	const [hasWorkspace, setHasWorkspace] = useState(true); // Set to true to show content
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const navigate = useNavigate();
	const { customer, openBillingPortal } = useCustomer({ expand: ["invoices"] });

	const workspace = useWorkspace();
	const deleteWorkspace = useMutation(api.workspace.deleteWorkspace);

	const currentProduct = useMemo(() => {
		return customer?.products?.[0] ?? null;
	}, [customer?.products]);

	useEffect(() => {
		if (!workspace) {
			setHasWorkspace(false);
		} else {
			setHasWorkspace(true);
		}
	}, [workspace]);

	const form = useForm({
		defaultValues: {
			workspaceName: workspace?.name || "",
			workspaceSlug: workspace?.slug || "",
		},
		validators: {
			onChange: schema,
		},
		onSubmit: async ({ value }) => {
			setIsSaving(true);
			try {
				const { data, error } =
					await authClient.organization.getActiveMemberRole();
				if (error !== null) {
					toast.error("Could not fetch current member's role", {
						description: error.message || "",
					});
					return;
				}

				if (data.role !== "owner") {
					toast.error("Only the owner can modify workspace details!");
					return;
				}

				await authClient.organization.update({
					data: { name: value.workspaceName, slug: value.workspaceSlug },
					organizationId: workspace?.id,
				});
				toast.success("Workspace updated successfully");
			} catch {
				toast.error("Failed to update workspace. Please try again.");
			} finally {
				setIsSaving(false);
			}
		},
	});

	const handleManageBilling = async () => {
		try {
			await openBillingPortal({
				returnUrl: `${process.env.VITE_APP_HOST}/dashboard/workspace/settings`,
			});
		} catch {
			toast.error("Failed to open billing portal. Please try again.");
		}
	};

	const handleUpgrade = () => {
		navigate({ to: "/dashboard/billing/plans" });
	};

	if (!hasWorkspace) {
		return (
			<div className="flex-1 flex items-center justify-center min-h-screen">
				<NoWorkspacesEmpty
					onCreateWorkspace={() => {
						navigate({ to: "/dashboard" });
					}}
				/>
			</div>
		);
	}

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			await deleteWorkspace();
			navigate({ to: "/dashboard" });
		} catch (error) {
			if (error instanceof ConvexError) {
				toast.error(error.data);
			}
		} finally {
			setIsDeleting(false);
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
						<h1 className="text-3xl font-bold tracking-tight">
							Workspace Settings
						</h1>
						<p className="text-muted-foreground mt-2">
							Manage your workspace settings and preferences
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
									key={tab.id}
									type="button"
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
					<div className="flex-1 max-w-3xl space-y-8">
						{activeTab === "general" && (
							<Card>
								<CardHeader>
									<CardTitle>General</CardTitle>
									<CardDescription>
										Update your workspace name and description
									</CardDescription>
								</CardHeader>
								<form
									onSubmit={(e) => {
										e.preventDefault();
										e.stopPropagation();
										form.handleSubmit();
									}}
								>
									<CardContent className="space-y-4">
										<form.Field name="workspaceName">
											{(field) => (
												<div className="space-y-2">
													<Label htmlFor="workspace-name">Workspace Name</Label>
													<Input
														id={"workspace-name"}
														value={field.state.value}
														onChange={(e) => field.handleChange(e.target.value)}
														placeholder="Enter workspace name"
													/>
												</div>
											)}
										</form.Field>

										<form.Field name="workspaceSlug">
											{(field) => (
												<div className="space-y-2">
													<Label htmlFor="workspace-slug">Workspace URL</Label>
													<div className="flex items-center gap-2">
														<span className="text-sm text-muted-foreground">
															taskloom.app/
														</span>
														<Input
															id={"workspace-slug"}
															value={field.state.value}
															onChange={(e) =>
																field.handleChange(e.target.value)
															}
															placeholder="workspace-url"
															className="flex-1"
														/>
													</div>
													<p className="text-xs text-muted-foreground">
														This is your workspace's URL-friendly identifier
													</p>
												</div>
											)}
										</form.Field>

										<div className="flex justify-end">
											<Button type="submit" disabled={isSaving}>
												{isSaving ? "Saving..." : "Save Changes"}
											</Button>
										</div>
									</CardContent>
								</form>
							</Card>
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
										{workspace?.members?.map((member) => (
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
													<Badge variant="secondary">{member.role}</Badge>
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

								<Card>
									<CardHeader>
										<CardTitle>Current Subscription</CardTitle>
										<CardDescription>
											Your current plan and billing details
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-6">
										{currentProduct ? (
											<div className="flex items-start justify-between">
												<div>
													<div className="flex items-center gap-2 mb-1">
														<h3 className="font-semibold text-lg">
															{currentProduct.name} Plan
														</h3>
														<Badge
															variant={
																currentProduct.status === "active"
																	? "default"
																	: "secondary"
															}
														>
															{currentProduct.status}
														</Badge>
													</div>
													<p className="text-sm text-muted-foreground mb-2">
														{currentProduct.id in plans
															? `${plans[currentProduct.id as keyof typeof plans].price} / month`
															: "N/A"}
													</p>
													{currentProduct.current_period_end && (
														<p className="text-xs text-muted-foreground">
															{`Next billing date: ${new Date(currentProduct.current_period_end).toLocaleDateString()}`}
														</p>
													)}
												</div>
												<div className="flex gap-2">
													<Button variant="outline" onClick={handleUpgrade}>
														Change plan
													</Button>
													<Button variant="outline" onClick={handleManageBilling}>
														<ExternalLink className="w-4 h-4 mr-2" />
														Manage
													</Button>
												</div>
											</div>
										) : (
											<div className="text-center py-4 text-muted-foreground">
												No active subscription
											</div>
										)}
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle>Usage</CardTitle>
										<CardDescription>
											Your current usage across workspace limits
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-6">
										{Object.keys(customer?.features || {}).map((key) => {
											const feature = customer?.features[key];
											if (!feature) return null;

											// Handle unlimited features
											if (feature.unlimited) {
												return (
													<div className="space-y-2" key={feature.id || key}>
														<div className="flex items-center justify-between text-sm mb-1">
															<span className="font-medium">
																{feature.name || key}
															</span>
															<span className="text-muted-foreground">
																Unlimited{" "}
																{feature.usage ? `(${feature.usage} used)` : ""}
															</span>
														</div>
													</div>
												);
											}

											// Handle features with limits
											const balance = feature.balance ?? 0;
											const limit = feature.included_usage ?? 0;
											const usage = feature.usage ?? 0;

											// Calculate percentage used (not remaining)
											const percentage = limit > 0 ? (usage / limit) * 100 : 0;

											return (
												<div className="space-y-2" key={feature.id || key}>
													<div className="flex items-center justify-between text-sm mb-1">
														<span className="font-medium">
															{feature.name || key}
														</span>
														<span className="text-muted-foreground">
															{balance} remaining / {limit} total
														</span>
													</div>
													<Progress value={percentage} />
												</div>
											);
										})}
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle>Billing History</CardTitle>
										<CardDescription>
											Your past invoices and payments
										</CardDescription>
									</CardHeader>
									<CardContent>
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Date</TableHead>
													<TableHead>Amount</TableHead>
													<TableHead>Status</TableHead>
													<TableHead className="w-[100px]"></TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{customer?.invoices?.map((invoice) => (
													<TableRow key={invoice.stripe_id}>
														<TableCell className="text-sm">
															{new Date(
																invoice.created_at,
															).toLocaleDateString()}
														</TableCell>
														<TableCell className="text-sm font-medium">
															${invoice.total}
														</TableCell>
														<TableCell>
															<Badge
																variant={
																	invoice.status === "paid"
																		? "default"
																		: "secondary"
																}
																className="capitalize"
															>
																{invoice.status}
															</Badge>
														</TableCell>
														<TableCell>
															<Button variant="ghost" size="icon" asChild>
																<a
																	href={invoice.hosted_invoice_url}
																	target="_blank"
																	rel="noopener noreferrer"
																>
																	<Download className="w-4 h-4" />
																</a>
															</Button>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</CardContent>
								</Card>
							</div>
						)}

						{activeTab === "danger" && (
							<Card className="border-destructive">
								<CardHeader>
									<CardTitle className="text-destructive">
										Danger Zone
									</CardTitle>
									<CardDescription>
										Irreversible actions that affect your workspace
									</CardDescription>
								</CardHeader>
								<CardContent>
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button variant="destructive">Delete Workspace</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>
													Are you absolutely sure?
												</AlertDialogTitle>
												<AlertDialogDescription>
													This action cannot be undone. This will permanently
													delete your workspace and remove all associated data
													including projects, boards, and team members.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>Cancel</AlertDialogCancel>
												<AlertDialogAction
													onClick={handleDelete}
													className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
													disabled={isDeleting}
												>
													{isDeleting ? "Deleting..." : "Delete Workspace"}
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</CardContent>
							</Card>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
