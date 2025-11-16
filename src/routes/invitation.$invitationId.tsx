import {
	createFileRoute,
	Link,
	redirect,
	useNavigate,
	useParams,
} from "@tanstack/react-router";
import { useCustomer } from "autumn-js/react";
import type { Invitation } from "better-auth/plugins";
import {
	AlertCircle,
	Building2,
	CheckCircle2,
	Clock,
	Layers,
	Mail,
	XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { formatDateUntil } from "@/lib/common/helper";

interface WorkspaceInvitation extends Invitation {
	organizationName: string;
	organizationSlug: string;
	inviterEmail: string;
}

const getRoleDescription = (role: string) => {
	switch (role) {
		case "owner":
			return "Full access to all workspace settings and billing";
		case "admin":
			return "Can manage projects and invite team members";
		case "member":
			return "Can view and edit projects";
		default:
			return ""
	}
}

export const Route = createFileRoute("/invitation/$invitationId")({
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
	const { invitationId } = useParams({ from: Route.id });
	const [invitation, setInvitation] = useState<WorkspaceInvitation | null>(
		null,
	)
	const [isLoading, setIsLoading] = useState(true);
	const [isAccepting, setIsAccepting] = useState(false);
	const [showDeclineDialog, setShowDeclineDialog] = useState(false);

	const navigate = useNavigate();
	const { track } = useCustomer();

	useEffect(() => {
		let isCancelled = false;

		const fetchInvitationDetails = async () => {
			const { data, error } = await authClient.organization.getInvitation({
				query: {
					id: invitationId,
				},
			})

			if (isCancelled) return;

			if (error !== null || data === null) {
				setInvitation(null);
				setIsLoading(false);
				return
			}

			setInvitation(data);
			setIsLoading(false);
		}

		fetchInvitationDetails();

		return () => {
			isCancelled = true;
		};
	}, [invitationId]);

	const handleAccept = async () => {
		setIsAccepting(true);
		try {
			const { data, error } = await authClient.organization.acceptInvitation({
				invitationId,
			})

			if (error !== null || data === null) {
				toast.error(
					error.message ||
						"An error occurred while accepting the invitation, please try again!",
				)
				return;
			}

			toast.success("Welcome to your new workspace!");

			await authClient.organization.setActive({
				organizationId: data.invitation.organizationId,
			})

			await track({ featureId: "members", value: 1 });

			navigate({ to: "/dashboard" });
		} finally {
			setIsAccepting(false);
		}
	}

	const handleDecline = async () => {
		setIsAccepting(true);
		try {
			const { data, error } = await authClient.organization.rejectInvitation({
				invitationId,
			})

			if (error !== null || data === null) {
				toast.error(
					error.message ||
						"An error occurred while declining the invitation, please try again!",
				)
				return;
			}

			toast.info("You've declined the invitation from this workspace!");

			navigate({ to: "/dashboard" });
		} finally {
			setIsAccepting(false);
		}
	}

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center px-6 bg-background">
				<Card className="w-full max-w-lg">
					<CardHeader className="text-center">
						<Skeleton className="h-8 w-48 mx-auto mb-2" />
						<Skeleton className="h-4 w-64 mx-auto" />
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="flex items-center gap-4 p-4 border border-border rounded-lg">
							<Skeleton className="w-12 h-12 rounded-full" />
							<div className="flex-1 space-y-2">
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-3 w-48" />
							</div>
						</div>
						<Skeleton className="h-24 w-full" />
						<Skeleton className="h-10 w-full" />
					</CardContent>
				</Card>
			</div>
		)
	}

	if (!invitation) {
		return (
			<div className="min-h-screen flex items-center justify-center px-6 bg-background">
				<Card className="w-full max-w-lg">
					<CardContent className="flex flex-col items-center justify-center py-12 text-center">
						<div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
							<XCircle className="w-8 h-8 text-destructive" />
						</div>
						<h2 className="text-xl font-semibold mb-2">Invitation Not Found</h2>
						<p className="text-muted-foreground mb-6">
							This invitation link is invalid or has been removed. Please
							contact the person who sent it to you.
						</p>
						<Button asChild>
							<Link to="/">Go to Homepage</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		)
	}

	if (new Date() > invitation.expiresAt) {
		return (
			<div className="min-h-screen flex items-center justify-center px-6 bg-background">
				<Card className="w-full max-w-lg">
					<CardContent className="flex flex-col items-center justify-center py-12 text-center">
						<div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
							<Clock className="w-8 h-8 text-orange-500" />
						</div>
						<h2 className="text-xl font-semibold mb-2">Invitation Expired</h2>
						<p className="text-muted-foreground mb-6">
							This invitation has expired. Please ask {invitation.inviterEmail}{" "}
							to send you a new invitation.
						</p>
						<Button asChild>
							<Link to="/login">Go to Login</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		)
	}

	if (invitation.status === "accepted") {
		return (
			<div className="min-h-screen flex items-center justify-center px-6 bg-background">
				<Card className="w-full max-w-lg">
					<CardContent className="flex flex-col items-center justify-center py-12 text-center">
						<div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
							<CheckCircle2 className="w-8 h-8 text-green-500" />
						</div>
						<h2 className="text-xl font-semibold mb-2">Already Accepted</h2>
						<p className="text-muted-foreground mb-6">
							You've already accepted this invitation and joined the workspace.
						</p>
						<Button asChild>
							<Link to="/dashboard">Go to Dashboard</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		)
	}

	if (invitation.status === "rejected") {
		return (
			<div className="min-h-screen flex items-center justify-center px-6 bg-background">
				<Card className="w-full max-w-lg">
					<CardContent className="flex flex-col items-center justify-center py-12 text-center">
						<div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
							<AlertCircle className="w-8 h-8 text-muted-foreground" />
						</div>
						<h2 className="text-xl font-semibold mb-2">Invitation Declined</h2>
						<p className="text-muted-foreground mb-6">
							You've declined this invitation to join{" "}
							{invitation.organizationName}.
						</p>
						<Button asChild>
							<Link to="/dashboard">Go to Dashboard</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		)
	}

	return (
		<div className="min-h-screen flex items-center justify-center px-6 py-12 bg-background">
			<div className="w-full max-w-lg">
				<Link to="/" className="flex items-center justify-center gap-2 mb-8">
					<div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
						<Layers className="w-6 h-6 text-primary-foreground" />
					</div>
					<span className="text-2xl font-semibold tracking-tight">
						Collably
					</span>
				</Link>

				<Card>
					<CardHeader className="text-center">
						<CardTitle className="text-2xl">You've been invited!</CardTitle>
						<CardDescription>
							You've been invited to join a workspace on Collably
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Inviter Info */}
						<div className="flex items-center gap-4 p-4 border border-border rounded-lg bg-muted/30">
							<Avatar className="w-12 h-12">
								<AvatarFallback>
									{invitation.inviterEmail[0]?.toUpperCase() || "?"}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1 min-w-0">
								<p className="text-sm text-muted-foreground truncate">
									{invitation.inviterEmail}
								</p>
							</div>
						</div>

						{/* Workspace Details */}
						<div className="space-y-4">
							<div className="flex items-start gap-3">
								<Building2 className="w-5 h-5 text-muted-foreground mt-0.5" />
								<div className="flex-1">
									<p className="text-sm text-muted-foreground">Workspace</p>
									<p className="font-semibold">{invitation.organizationName}</p>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
								<div className="flex-1">
									<p className="text-sm text-muted-foreground">Invited email</p>
									<p className="font-medium">{invitation.email}</p>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
								<div className="flex-1">
									<p className="text-sm text-muted-foreground">
										Invitation expires
									</p>
									<p className="font-medium">
										{formatDateUntil(invitation.expiresAt)}
									</p>
								</div>
							</div>
						</div>

						{/* Role Badge */}
						<div className="p-4 border border-border rounded-lg bg-primary/5">
							<div className="flex items-center gap-2 mb-2">
								<Badge variant="default" className="capitalize">
									{invitation.role}
								</Badge>
							</div>
							<p className="text-sm text-muted-foreground">
								{getRoleDescription(invitation.role)}
							</p>
						</div>

						{/* Action Buttons */}
						<div className="flex flex-col gap-3 pt-2">
							<Button
								size="lg"
								onClick={handleAccept}
								disabled={isAccepting}
								className="w-full"
							>
								{isAccepting ? "Accepting..." : "Accept Invitation"}
							</Button>
							<Button
								size="lg"
								variant="outline"
								onClick={() => setShowDeclineDialog(true)}
								className="w-full"
							>
								Decline
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Decline Confirmation Dialog */}
			<AlertDialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Decline invitation?</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to decline this invitation to join{" "}
							{invitation.organizationName}? You won't be able to accept it
							again later.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDecline}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Decline Invitation
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
