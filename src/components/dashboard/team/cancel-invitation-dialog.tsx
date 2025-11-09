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
import { authClient } from "@/lib/auth-client";
import type { WorkspaceMember } from "@/lib/common/types";
import type { Invitation } from "better-auth/plugins";
import type { SetStateAction } from "react";
import { toast } from "sonner";

interface Props {
	cancelInviteOpen: boolean;
	setCancelInviteOpen: React.Dispatch<SetStateAction<boolean>>;
	selectedMember: WorkspaceMember | null;
	selectedInvite: Invitation | null;
}

export default function CancelInvitationDialog({
	cancelInviteOpen,
	setCancelInviteOpen,
	selectedInvite,
	selectedMember,
}: Props) {
	const confirmCancelInvite = async () => {
		if (selectedInvite !== null) {
			const { error } = await authClient.organization.cancelInvitation({
				invitationId: selectedInvite.id,
			});

			if (error !== null) {
				toast.error(error.message || "Something went wrong!", {
					description: "Invitation might not've been  cancelled",
				});
			} else {
				toast.success("Invitation successfully cancelled!");
			}
		}
		setCancelInviteOpen(false);
	};

	return (
		<AlertDialog open={cancelInviteOpen} onOpenChange={setCancelInviteOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Cancel invitation?</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to cancel the invitation for{" "}
						{selectedMember?.user?.email}? They will not be able to join the
						workspace using this invitation.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Keep Invitation</AlertDialogCancel>
					<AlertDialogAction
						onClick={confirmCancelInvite}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						Cancel Invite
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
