import { createFileRoute } from "@tanstack/react-router";
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
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
	Search,
	UserPlus,
	MoreVertical,
	Mail,
	Calendar,
} from "lucide-react";
import { NoTeamMembersEmpty } from "@/components/empty-states";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/team")({
	component: RouteComponent,
});

function RouteComponent() {
	const [searchQuery, setSearchQuery] = useState("");
	const [roleFilter, setRoleFilter] = useState("all");
	const [isInviteOpen, setIsInviteOpen] = useState(false);
	const [inviteEmail, setInviteEmail] = useState("");
	const [inviteRole, setInviteRole] = useState("member");
	const [inviteMessage, setInviteMessage] = useState("");

	const members = [
		{
			name: "John Doe",
			email: "john@example.com",
			role: "Owner",
			status: "active",
			joinedDate: "Jan 2024",
			avatar: "/placeholder.svg",
		},
		{
			name: "Alice Smith",
			email: "alice@example.com",
			role: "Admin",
			status: "active",
			joinedDate: "Feb 2024",
			avatar: "/placeholder.svg",
		},
		{
			name: "Bob Johnson",
			email: "bob@example.com",
			role: "Member",
			status: "active",
			joinedDate: "Mar 2024",
			avatar: "/placeholder.svg",
		},
		{
			name: "Charlie Brown",
			email: "charlie@example.com",
			role: "Member",
			status: "pending",
			joinedDate: "Invited 2 days ago",
			avatar: "/placeholder.svg",
		},
		{
			name: "Diana Prince",
			email: "diana@example.com",
			role: "Admin",
			status: "active",
			joinedDate: "Jan 2024",
			avatar: "/placeholder.svg",
		},
	];

	const filteredMembers = members.filter((member) => {
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

			<div className="max-w-7xl mx-auto px-6 py-8">
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
						<p className="text-sm text-muted-foreground mb-1">Total Members</p>
						<p className="text-2xl font-bold">{members.length}</p>
					</div>
					<div className="p-4 border border-border rounded-lg">
						<p className="text-sm text-muted-foreground mb-1">Active</p>
						<p className="text-2xl font-bold">
							{members.filter((m) => m.status === "active").length}
						</p>
					</div>
					<div className="p-4 border border-border rounded-lg">
						<p className="text-sm text-muted-foreground mb-1">
							Pending Invites
						</p>
						<p className="text-2xl font-bold">
							{members.filter((m) => m.status === "pending").length}
						</p>
					</div>
				</div>

				{/* Members Table */}
				{members.length === 0 ? (
					<NoTeamMembersEmpty onInvite={() => setIsInviteOpen(true)} />
				) : (
					<div className="border border-border rounded-lg overflow-hidden">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Member</TableHead>
									<TableHead>Role</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Joined</TableHead>
									<TableHead className="w-[100px]"></TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredMembers.length === 0 ? (
									<TableRow>
										<TableCell
											colSpan={5}
											className="text-center py-8 text-muted-foreground"
										>
											No members found
										</TableCell>
									</TableRow>
								) : (
									filteredMembers.map((member, idx) => (
										<TableRow key={idx}>
											<TableCell>
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
											</TableCell>
											<TableCell>
												<Badge
													variant={
														member.role === "Owner" ? "default" : "secondary"
													}
												>
													{member.role}
												</Badge>
											</TableCell>
											<TableCell>
												<Badge
													variant={
														member.status === "active" ? "default" : "outline"
													}
												>
													{member.status === "active" ? "Active" : "Pending"}
												</Badge>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2 text-sm text-muted-foreground">
													<Calendar className="w-4 h-4" />
													<span>{member.joinedDate}</span>
												</div>
											</TableCell>
											<TableCell>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon">
															<MoreVertical className="w-4 h-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem>View profile</DropdownMenuItem>
														<DropdownMenuItem>Change role</DropdownMenuItem>
														{member.status === "pending" && (
															<DropdownMenuItem>
																Resend invitation
															</DropdownMenuItem>
														)}
														<DropdownMenuItem className="text-destructive">
															{member.status === "pending"
																? "Cancel invitation"
																: "Remove member"}
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
				)}
			</div>
		</div>
	);
}
