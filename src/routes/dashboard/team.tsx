import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { DialogTrigger } from "@/components/ui/dialog";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ArrowLeft,
	Search,
	UserPlus,
	MoreVertical,
	Mail,
	Calendar,
	Shield,
} from "lucide-react";
import { NoTeamMembersEmpty } from "@/components/empty-states";
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
// import { authClient } from "@/lib/auth-client";

interface Member {
	id: number;
	name: string;
	email: string;
	role: string;
	status: "active" | "pending";
	joinedDate: string;
	avatar: string;
}

export const Route = createFileRoute("/dashboard/team")({
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
	const [searchQuery, setSearchQuery] = useState("");
	const [roleFilter, setRoleFilter] = useState("all");
	const [isInviteOpen, setIsInviteOpen] = useState(false);
	const [inviteEmail, setInviteEmail] = useState("");
	const [inviteRole, setInviteRole] = useState("member");
	const [inviteMessage, setInviteMessage] = useState("");
	const [viewProfileOpen, setViewProfileOpen] = useState(false);
	const [changeRoleOpen, setChangeRoleOpen] = useState(false);
	const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
	const [selectedMember, setSelectedMember] = useState<Member | null>(null);
	const [selectedRole, setSelectedRole] = useState("");
	const [isChangingRole, setIsChangingRole] = useState(false);

	// const members = authClient.organization.listMembers();

	// console.log(members);

	const teamMembers: Member[] = [
		{
			id: 1,
			name: "John Doe",
			email: "john@example.com",
			role: "Owner",
			status: "active",
			joinedDate: "Jan 2024",
			avatar: "/placeholder.svg",
		},
		{
			id: 2,
			name: "Alice Smith",
			email: "alice@example.com",
			role: "Admin",
			status: "active",
			joinedDate: "Feb 2024",
			avatar: "/placeholder.svg",
		},
		{
			id: 3,
			name: "Bob Johnson",
			email: "bob@example.com",
			role: "Member",
			status: "active",
			joinedDate: "Mar 2024",
			avatar: "/placeholder.svg",
		},
		{
			id: 4,
			name: "Charlie Brown",
			email: "charlie@example.com",
			role: "Member",
			status: "pending",
			joinedDate: "Invited 2 days ago",
			avatar: "/placeholder.svg",
		},
		{
			id: 5,
			name: "Diana Prince",
			email: "diana@example.com",
			role: "Admin",
			status: "active",
			joinedDate: "Jan 2024",
			avatar: "/placeholder.svg",
		},
	];

	const filteredMembers = teamMembers.filter((member) => {
		const matchesSearch =
			member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			member.email.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesRole =
			roleFilter === "all" || member.role.toLowerCase() === roleFilter;
		return matchesSearch && matchesRole;
	});

	const handleInvite = () => {
		console.log("[v0] Inviting member:", {
			inviteEmail,
			inviteRole,
			inviteMessage,
		});
		setIsInviteOpen(false);
		setInviteEmail("");
		setInviteRole("member");
		setInviteMessage("");
	};

	const handleViewProfile = (member: Member) => {
		setSelectedMember(member);
		setViewProfileOpen(true);
	};

	const handleChangeRole = (member: Member) => {
		setSelectedMember(member);
		setSelectedRole(member.role);
		setChangeRoleOpen(true);
	};

	const handleRemoveMember = (member: Member) => {
		setSelectedMember(member);
		setRemoveDialogOpen(true);
	};

	const confirmChangeRole = async () => {
		setIsChangingRole(true);
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1000));
		console.log(`Changing ${selectedMember?.name} role to ${selectedRole}`);
		setIsChangingRole(false);
		setChangeRoleOpen(false);
	};

	const confirmRemoveMember = async () => {
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 500));
		console.log(`Removing member: ${selectedMember?.name}`);
		setRemoveDialogOpen(false);
	};

	return (
		<div className="flex-1 space-y-6 p-6">
			{/* Header */}
			<header className="border-b border-border">
				<div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
					<Link to="/dashboard">
						<Button variant="ghost" size="icon">
							<ArrowLeft className="w-5 h-5" />
						</Button>
					</Link>
					<div className="flex-1">
						<h1 className="text-xl font-semibold">Team Members</h1>
						<p className="text-sm text-muted-foreground">
							Manage your workspace team
						</p>
					</div>
					<Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
						<DialogTrigger asChild>
							<Button>
								<UserPlus className="w-4 h-4 mr-2" />
								Invite Members
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Invite Team Members</DialogTitle>
								<DialogDescription>
									Send an invitation to join your workspace
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4 py-4">
								<div className="space-y-2">
									<Label htmlFor="invite-email">Email address</Label>
									<Input
										id={"invite-email"}
										type="email"
										placeholder="colleague@example.com"
										value={inviteEmail}
										onChange={(e) => setInviteEmail(e.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="invite-role">Role</Label>
									<Select value={inviteRole} onValueChange={setInviteRole}>
										<SelectTrigger id={"invite-role"}>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="admin">
												Admin - Full workspace access
											</SelectItem>
											<SelectItem value="member">
												Member - Standard access
											</SelectItem>
											<SelectItem value="viewer">
												Viewer - Read-only access
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="invite-message">
										Custom message (optional)
									</Label>
									<Textarea
										id={"invite-message"}
										placeholder="Add a personal message to your invitation..."
										className="min-h-[80px]"
										value={inviteMessage}
										onChange={(e) => setInviteMessage(e.target.value)}
									/>
								</div>
							</div>
							<DialogFooter>
								<Button
									variant="outline"
									onClick={() => setIsInviteOpen(false)}
								>
									Cancel
								</Button>
								<Button onClick={handleInvite} disabled={!inviteEmail.trim()}>
									<Mail className="w-4 h-4 mr-2" />
									Send Invitation
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</header>

			<Card>
				<CardHeader>
					<CardTitle>Team Members</CardTitle>
					<CardDescription>
						Manage your team members and their roles
					</CardDescription>
				</CardHeader>
				<CardContent>
					{/* Filters */}
					<div className="flex items-center gap-4 mb-6">
						<div className="relative flex-1 max-w-md">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
							<Input
								placeholder="Search members..."
								className="pl-9"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
						<Select value={roleFilter} onValueChange={setRoleFilter}>
							<SelectTrigger className="w-40">
								<SelectValue placeholder="Filter by role" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All roles</SelectItem>
								<SelectItem value="owner">Owner</SelectItem>
								<SelectItem value="admin">Admin</SelectItem>
								<SelectItem value="member">Member</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Stats */}
					<div className="grid md:grid-cols-3 gap-4 mb-6">
						<div className="p-4 border border-border rounded-lg">
							<p className="text-sm text-muted-foreground mb-1">
								Total Members
							</p>
							<p className="text-2xl font-bold">{teamMembers.length}</p>
						</div>
						<div className="p-4 border border-border rounded-lg">
							<p className="text-sm text-muted-foreground mb-1">Active</p>
							<p className="text-2xl font-bold">
								{teamMembers.filter((m) => m.status === "active").length}
							</p>
						</div>
						<div className="p-4 border border-border rounded-lg">
							<p className="text-sm text-muted-foreground mb-1">
								Pending Invites
							</p>
							<p className="text-2xl font-bold">
								{teamMembers.filter((m) => m.status === "pending").length}
							</p>
						</div>
					</div>

					{/* Members Table */}
					{teamMembers.length === 0 ? (
						<NoTeamMembersEmpty onInvite={() => setIsInviteOpen(true)} />
					) : (
						<div className="border border-border rounded-lg overflow-hidden">
							<table className="w-full">
								<thead>
									<tr>
										<th className="p-4">Member</th>
										<th className="p-4">Role</th>
										<th className="p-4">Status</th>
										<th className="p-4">Joined</th>
										<th className="p-4 w-[100px]"></th>
									</tr>
								</thead>
								<tbody>
									{filteredMembers.length === 0 ? (
										<tr>
											<td
												colSpan={5}
												className="text-center py-8 text-muted-foreground"
											>
												No members found
											</td>
										</tr>
									) : (
										filteredMembers.map((member) => (
											<tr key={member.id} className="border-t">
												<td className="p-4">
													<div className="flex items-center gap-3">
														<Avatar className="w-10 h-10">
															<AvatarImage
																src={member.avatar || "/placeholder.svg"}
															/>
															<AvatarFallback>{member.name[0]}</AvatarFallback>
														</Avatar>
														<div>
															<p className="font-medium">{member.name}</p>
															<p className="text-sm text-muted-foreground">
																{member.email}
															</p>
														</div>
													</div>
												</td>
												<td className="p-4">
													<Badge
														variant={
															member.role === "Owner" ? "default" : "secondary"
														}
													>
														{member.role}
													</Badge>
												</td>
												<td className="p-4">
													<Badge
														variant={
															member.status === "active" ? "default" : "outline"
														}
													>
														{member.status === "active" ? "Active" : "Pending"}
													</Badge>
												</td>
												<td className="p-4">
													<div className="flex items-center gap-2 text-sm text-muted-foreground">
														<Calendar className="w-4 h-4" />
														<span>{member.joinedDate}</span>
													</div>
												</td>
												<td className="p-4 text-right">
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button variant="ghost" size="icon">
																<MoreVertical className="h-4 w-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuItem
																onClick={() => handleViewProfile(member)}
															>
																View Profile
															</DropdownMenuItem>
															<DropdownMenuItem
																onClick={() => handleChangeRole(member)}
															>
																Change Role
															</DropdownMenuItem>
															<DropdownMenuSeparator />
															<DropdownMenuItem
																className="text-destructive"
																onClick={() => handleRemoveMember(member)}
															>
																Remove Member
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>
					)}
				</CardContent>
			</Card>

			<Dialog open={viewProfileOpen} onOpenChange={setViewProfileOpen}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Member Profile</DialogTitle>
						<DialogDescription>
							View detailed information about this team member
						</DialogDescription>
					</DialogHeader>
					{selectedMember && (
						<div className="space-y-6">
							<div className="flex items-center gap-4">
								<Avatar className="h-20 w-20">
									<AvatarImage
										src={selectedMember.avatar || "/placeholder.svg"}
										alt={selectedMember.name}
									/>
									<AvatarFallback>
										{selectedMember.name
											.split(" ")
											.map((n) => n[0])
											.join("")}
									</AvatarFallback>
								</Avatar>
								<div className="flex-1">
									<h3 className="text-lg font-semibold">
										{selectedMember.name}
									</h3>
									<Badge
										variant={
											selectedMember.status === "Active"
												? "default"
												: "secondary"
										}
									>
										{selectedMember.status}
									</Badge>
								</div>
							</div>

							<div className="space-y-4">
								<div className="flex items-center gap-3 text-sm">
									<Mail className="h-4 w-4 text-muted-foreground" />
									<div>
										<p className="text-xs text-muted-foreground">Email</p>
										<p className="font-medium">{selectedMember.email}</p>
									</div>
								</div>

								<div className="flex items-center gap-3 text-sm">
									<Shield className="h-4 w-4 text-muted-foreground" />
									<div>
										<p className="text-xs text-muted-foreground">Role</p>
										<p className="font-medium capitalize">
											{selectedMember.role}
										</p>
									</div>
								</div>

								<div className="flex items-center gap-3 text-sm">
									<Calendar className="h-4 w-4 text-muted-foreground" />
									<div>
										<p className="text-xs text-muted-foreground">Joined</p>
										<p className="font-medium">{selectedMember.joinedDate}</p>
									</div>
								</div>
							</div>
						</div>
					)}
					<DialogFooter>
						<Button variant="outline" onClick={() => setViewProfileOpen(false)}>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={changeRoleOpen} onOpenChange={setChangeRoleOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Change Member Role</DialogTitle>
						<DialogDescription>
							Update the role and permissions for {selectedMember?.name}
						</DialogDescription>
					</DialogHeader>
					{selectedMember && (
						<div className="space-y-4 py-4">
							<div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
								<Avatar>
									<AvatarImage
										src={selectedMember.avatar || "/placeholder.svg"}
										alt={selectedMember.name}
									/>
									<AvatarFallback>
										{selectedMember.name
											.split(" ")
											.map((n) => n[0])
											.join("")}
									</AvatarFallback>
								</Avatar>
								<div className="flex-1 min-w-0">
									<p className="font-medium truncate">{selectedMember.name}</p>
									<p className="text-sm text-muted-foreground truncate">
										{selectedMember.email}
									</p>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="role">Role</Label>
								<Select value={selectedRole} onValueChange={setSelectedRole}>
									<SelectTrigger id={"role"}>
										<SelectValue placeholder="Select a role" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Owner">Owner</SelectItem>
										<SelectItem value="Admin">Admin</SelectItem>
										<SelectItem value="Member">Member</SelectItem>
										<SelectItem value="Viewer">Viewer</SelectItem>
									</SelectContent>
								</Select>
								{selectedRole && (
									<p className="text-sm text-muted-foreground">
										{selectedRole === "Owner" &&
											"Full access to all workspace settings"}
										{selectedRole === "Admin" &&
											"Can manage projects and members"}
										{selectedRole === "Member" && "Can view and edit projects"}
										{selectedRole === "Viewer" && "Read-only access"}
									</p>
								)}
							</div>
						</div>
					)}
					<DialogFooter>
						<Button variant="outline" onClick={() => setChangeRoleOpen(false)}>
							Cancel
						</Button>
						<Button onClick={confirmChangeRole} disabled={isChangingRole}>
							{isChangingRole ? "Updating..." : "Update Role"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Remove team member?</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to remove {selectedMember?.name} from the
							workspace? They will lose access to all projects and data.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmRemoveMember}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Remove Member
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
