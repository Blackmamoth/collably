import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import type { Invitation } from "better-auth/plugins";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, MoreVertical, Search } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import CancelInvitationDialog from "@/components/dashboard/team/cancel-invitation-dialog";
import ChangeRoleDialog from "@/components/dashboard/team/change-role-dialog";
import InvitationList from "@/components/dashboard/team/invitation-list";
import InviteMemberDialog from "@/components/dashboard/team/invite-member-dialog";
import RemoveMemberDialog from "@/components/dashboard/team/remove-member-dialog";
import ViewProfileDialog from "@/components/dashboard/team/view-profile-dialog";
import { NoTeamMembersEmpty } from "@/components/empty-states";
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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { formatDateSince } from "@/lib/common/helper";
import type { WorkspaceMember } from "@/lib/common/types";
import { useWorkspace } from "@/lib/workspace-context";

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
	const [currentPage, setCurrentPage] = useState(1);
	const [currentInvitePage, setCurrentInvitePage] = useState(1);
	const itemsPerPage = 10;

	const offset = (currentPage - 1) * itemsPerPage;
	const inviteOffset = (currentInvitePage - 1) * itemsPerPage;
	const workspaceMembers = useQuery(api.workspace.getWorkspaceMembers, {
		limit: itemsPerPage,
		offset: offset,
	});
	const workspaceInvitationsResponse = useQuery(api.workspace.getWorkspaceInvitations, {
		limit: itemsPerPage,
		offset: inviteOffset,
	});
	// Response is always { invitations: [], total: number }
	const workspaceInvitations = (workspaceInvitationsResponse?.invitations || []) as Invitation[];

	const workspace = useWorkspace();

	const filteredMembers = useMemo(() => {
		if (!workspaceMembers?.members) return [];

		let members = workspaceMembers.members;

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			members = members.filter(
				(member) =>
					member.user.name.toLowerCase().includes(query) ||
					member.user.email.toLowerCase().includes(query),
			);
		}

		// Filter by role
		if (roleFilter !== "all") {
			members = members.filter((member) => member.role === roleFilter);
		}

		return members;
	}, [workspaceMembers?.members, searchQuery, roleFilter]);

	// Reset to page 1 when filters change
	const handleFilterChange = useCallback(() => {
		setCurrentPage(1);
	}, []);

	// Calculate pagination info for members
	// Note: If API returns total count, use it; otherwise estimate based on current page
	const hasMorePages = workspaceMembers?.members?.length === itemsPerPage;
	// Try to get total from API response, fallback to estimating
	const totalMembers = workspaceMembers && 'total' in workspaceMembers 
		? (workspaceMembers as { total: number }).total 
		: null;
	const estimatedTotal = totalMembers ?? (hasMorePages ? (currentPage * itemsPerPage) + 1 : offset + (workspaceMembers?.members?.length ?? 0));
	const totalPages = totalMembers ? Math.ceil(totalMembers / itemsPerPage) : (hasMorePages ? currentPage + 1 : currentPage);

	// Calculate pagination info for invitations
	const hasMoreInvitePages = workspaceInvitations.length === itemsPerPage;
	const totalInvitations = workspaceInvitationsResponse?.total ?? null;
	const totalInvitePages = totalInvitations ? Math.ceil(totalInvitations / itemsPerPage) : (hasMoreInvitePages ? currentInvitePage + 1 : currentInvitePage);

	const handleViewProfile = useCallback((member: WorkspaceMember) => {
		setSelectedMember(member);
		setViewProfileOpen(true);
	}, []);

	const handleChangeRole = useCallback((member: WorkspaceMember) => {
		setSelectedMember(member);
		setSelectedRole(member.role);
		setChangeRoleOpen(true);
	}, []);

	const handleRemoveMember = useCallback((member: WorkspaceMember) => {
		setSelectedMember(member);
		setRemoveDialogOpen(true);
	}, []);

	const handleCancelInvite = useCallback((invite: Invitation) => {
		setSelectedInvite(invite);
		setCancelInviteOpen(true);
	}, []);

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
								onChange={(e) => {
									setSearchQuery(e.target.value);
									handleFilterChange();
								}}
							/>
						</div>
						<Select value={roleFilter} onValueChange={(value) => {
							setRoleFilter(value);
							handleFilterChange();
						}}>
							<SelectTrigger className="w-40">
								<SelectValue placeholder="Filter by role" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All roles</SelectItem>
								<SelectItem value="owner">Owner</SelectItem>
								<SelectItem value="member">Member</SelectItem>
								<SelectItem value="viewer">Viewer</SelectItem>
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
								{totalMembers ?? estimatedTotal}
							</p>
						</div>
						<div className="p-4 border border-border rounded-lg">
							<p className="text-sm text-muted-foreground mb-1">Active</p>
							<p className="text-2xl font-bold">
								{workspaceMembers?.members.length || 0}
							</p>
						</div>
						<div className="p-4 border border-border rounded-lg">
							<p className="text-sm text-muted-foreground mb-1">
								Invitations
							</p>
							<p className="text-2xl font-bold">
								{totalInvitations ?? 0}
							</p>
						</div>
					</div>

					{/* Members Table */}
					{workspaceMembers?.members.length === 0 &&
					workspaceInvitations.length === 0 &&
					!workspaceInvitationsResponse ? (
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
										{filteredMembers.length === 0 ? (
											<tr>
												<td
													colSpan={4}
													className="text-center py-8 text-muted-foreground"
												>
													No members found
												</td>
											</tr>
										) : (
											filteredMembers.map((member) => (
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

							{/* Members Pagination Controls */}
							<div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
								<div className="text-sm text-muted-foreground">
									Showing {offset + 1} to {Math.min(offset + itemsPerPage, estimatedTotal)} of {totalMembers ? totalMembers : `${estimatedTotal}+`} members
								</div>
								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
										disabled={currentPage === 1}
									>
										<ChevronLeft className="w-4 h-4" />
										Previous
									</Button>
									{totalPages > 1 && (
										<div className="flex items-center gap-1">
											{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
												let pageNum: number;
												if (totalPages <= 5) {
													pageNum = i + 1;
												} else if (currentPage <= 3) {
													pageNum = i + 1;
												} else if (currentPage >= totalPages - 2) {
													pageNum = totalPages - 4 + i;
												} else {
													pageNum = currentPage - 2 + i;
												}
												return (
													<Button
														key={pageNum}
														variant={currentPage === pageNum ? "default" : "outline"}
														size="sm"
														className="w-9"
														onClick={() => setCurrentPage(pageNum)}
													>
														{pageNum}
													</Button>
												);
											})}
										</div>
									)}
									<Button
										variant="outline"
										size="sm"
										onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
										disabled={currentPage === totalPages || !hasMorePages}
									>
										Next
										<ChevronRight className="w-4 h-4" />
									</Button>
								</div>
							</div>

							{workspaceInvitations.length > 0 && (
								<>
									<InvitationList
										handleCancelInvite={handleCancelInvite}
										workspaceInvitations={workspaceInvitations}
									/>

									{/* Invitations Pagination Controls */}
									<div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
										<div className="text-sm text-muted-foreground">
											Showing {inviteOffset + 1} to {Math.min(inviteOffset + itemsPerPage, totalInvitations ?? 0)} of {totalInvitations ?? 0} invitations
										</div>
										<div className="flex items-center gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() => setCurrentInvitePage((p) => Math.max(1, p - 1))}
												disabled={currentInvitePage === 1}
											>
												<ChevronLeft className="w-4 h-4" />
												Previous
											</Button>
											{totalInvitePages > 1 && (
												<div className="flex items-center gap-1">
													{Array.from({ length: Math.min(5, totalInvitePages) }, (_, i) => {
														let pageNum: number;
														if (totalInvitePages <= 5) {
															pageNum = i + 1;
														} else if (currentInvitePage <= 3) {
															pageNum = i + 1;
														} else if (currentInvitePage >= totalInvitePages - 2) {
															pageNum = totalInvitePages - 4 + i;
														} else {
															pageNum = currentInvitePage - 2 + i;
														}
														return (
															<Button
																key={pageNum}
																variant={currentInvitePage === pageNum ? "default" : "outline"}
																size="sm"
																className="w-9"
																onClick={() => setCurrentInvitePage(pageNum)}
															>
																{pageNum}
															</Button>
														);
													})}
												</div>
											)}
											<Button
												variant="outline"
												size="sm"
												onClick={() => setCurrentInvitePage((p) => Math.min(totalInvitePages, p + 1))}
												disabled={currentInvitePage === totalInvitePages || !hasMoreInvitePages}
											>
												Next
												<ChevronRight className="w-4 h-4" />
											</Button>
										</div>
									</div>
								</>
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
