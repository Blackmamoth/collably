import { createFileRoute, redirect, Link } from "@tanstack/react-router";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { ArrowLeft, Search, MoreVertical, Calendar } from "lucide-react";
import { NoTeamMembersEmpty } from "@/components/empty-states";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { WorkspaceMember } from "@/lib/common/types";
import type { Invitation } from "better-auth/plugins";
import { formatDateSince } from "@/lib/common/helper";
import { useWorkspace } from "@/lib/workspace-context";
import InviteMemberDialog from "@/components/dashboard/team/invite-member-dialog";
import InvitationList from "@/components/dashboard/team/invitation-list";
import ViewProfileDialog from "@/components/dashboard/team/view-profile-dialog";
import ChangeRoleDialog from "@/components/dashboard/team/change-role-dialog";
import RemoveMemberDialog from "@/components/dashboard/team/remove-member-dialog";
import CancelInvitationDialog from "@/components/dashboard/team/cancel-invitation-dialog";

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
	const [viewProfileOpen, setViewProfileOpen] = useState(false);
	const [changeRoleOpen, setChangeRoleOpen] = useState(false);
	const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
	const [cancelInviteOpen, setCancelInviteOpen] = useState(false);
	const [selectedMember, setSelectedMember] = useState<WorkspaceMember | null>(
		null,
	);
	const [selectedInvite, setSelectedInvite] = useState<Invitation | null>(null);
	const [selectedRole, setSelectedRole] = useState("");

	const workspaceMembers = useQuery(api.workspace.getWorkspaceMembers);
	const workspaceInvitations =
		useQuery(api.workspace.getWorkspaceInvitations) || [];

	const workspace = useWorkspace();

	const handleViewProfile = (member: WorkspaceMember) => {
		setSelectedMember(member);
		setViewProfileOpen(true);
	};

	const handleChangeRole = (member: WorkspaceMember) => {
		setSelectedMember(member);
		setSelectedRole(member.role);
		setChangeRoleOpen(true);
	};

	const handleRemoveMember = (member: WorkspaceMember) => {
		setSelectedMember(member);
		setRemoveDialogOpen(true);
	};

	const handleCancelInvite = (invite: Invitation) => {
		setSelectedInvite(invite);
		setCancelInviteOpen(true);
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
					<InviteMemberDialog
						isInviteOpen={isInviteOpen}
						setIsInviteOpen={setIsInviteOpen}
						workspace={workspace}
					/>
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
							<p className="text-2xl font-bold">
								{workspaceMembers?.members.length}
							</p>
						</div>
						<div className="p-4 border border-border rounded-lg">
							<p className="text-sm text-muted-foreground mb-1">Active</p>
							<p className="text-2xl font-bold">
								{workspaceMembers?.members.length}
							</p>
						</div>
						<div className="p-4 border border-border rounded-lg">
							<p className="text-sm text-muted-foreground mb-1">
								Pending Invites
							</p>
							<p className="text-2xl font-bold">
								{workspaceInvitations.length}
							</p>
						</div>
					</div>

					{/* Members Table */}
					{workspaceMembers?.members.length === 0 &&
					workspaceInvitations.length === 0 ? (
						<NoTeamMembersEmpty onInvite={() => setIsInviteOpen(true)} />
					) : (
						<>
							<div className="border border-border rounded-lg overflow-hidden mb-6">
								<table className="w-full">
									<thead className="bg-muted/50">
										<tr className="border-b border-border">
											<th className="text-left p-4 font-medium text-sm">
												Member
											</th>
											<th className="text-left p-4 font-medium text-sm">
												Role
											</th>
											<th className="text-left p-4 font-medium text-sm">
												Joined
											</th>
											<th className="text-right p-4 font-medium text-sm w-20">
												Actions
											</th>
										</tr>
									</thead>
									<tbody>
										{workspaceMembers?.members.length === 0 ? (
											<tr>
												<td
													colSpan={4}
													className="text-center py-8 text-muted-foreground"
												>
													No members found
												</td>
											</tr>
										) : (
											workspaceMembers?.members.map((member) => (
												<tr
													key={member.id}
													className="border-t border-border hover:bg-muted/50 transition-colors"
												>
													<td className="p-4">
														<div className="flex items-center gap-3">
															<Avatar className="w-10 h-10">
																<AvatarImage
																	src={member.user.image || "/placeholder.svg"}
																/>
																<AvatarFallback>
																	{member.user.name[0]}
																</AvatarFallback>
															</Avatar>
															<div>
																<p className="font-medium">
																	{member.user.name}
																</p>
																<p className="text-sm text-muted-foreground">
																	{member.user.email}
																</p>
															</div>
														</div>
													</td>
													<td className="p-4">
														<Badge
															variant={
																member.role === "owner"
																	? "default"
																	: "secondary"
															}
														>
															{member.role}
														</Badge>
													</td>
													<td className="p-4">
														<div className="flex items-center gap-2 text-sm text-muted-foreground">
															<Calendar className="w-4 h-4" />
															<span>{formatDateSince(member.createdAt)}</span>
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

							{workspaceInvitations.length > 0 && (
								<InvitationList
									handleCancelInvite={handleCancelInvite}
									workspaceInvitations={workspaceInvitations}
								/>
							)}
						</>
					)}
				</CardContent>
			</Card>

			<ViewProfileDialog
				selectedMember={selectedMember}
				setViewProfileOpen={setViewProfileOpen}
				viewProfileOpen={viewProfileOpen}
			/>

			<ChangeRoleDialog
				changeRoleOpen={changeRoleOpen}
				setChangeRoleOpen={setChangeRoleOpen}
				selectedRole={selectedRole}
				setSelectedRole={setSelectedRole}
				selectedMember={selectedMember}
			/>

			<RemoveMemberDialog
				removeDialogOpen={removeDialogOpen}
				setRemoveDialogOpen={setRemoveDialogOpen}
				selectedMember={selectedMember}
			/>

			<CancelInvitationDialog
				cancelInviteOpen={cancelInviteOpen}
				setCancelInviteOpen={setCancelInviteOpen}
				selectedInvite={selectedInvite}
				selectedMember={selectedMember}
			/>
		</div>
	);
}
