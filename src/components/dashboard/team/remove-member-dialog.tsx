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
import { useWorkspace } from "@/lib/workspace-context";
import type { SetStateAction } from "react";
import { toast } from "sonner";

interface Props {
	removeDialogOpen: boolean;
	setRemoveDialogOpen: React.Dispatch<SetStateAction<boolean>>;
	selectedMember: WorkspaceMember | null;
}

export default function RemoveMemberDialog({
	removeDialogOpen,
	setRemoveDialogOpen,
	selectedMember,
}: Props) {
	const workspace = useWorkspace();

	const confirmRemoveMember = async () => {
		if (selectedMember !== null) {
			if (workspace !== null) {
				const { error } = await authClient.organization.removeMember({
					memberIdOrEmail: selectedMember.id,
					organizationId: workspace.id,
				});

				if (error !== null) {
					toast.error(
						error.message ||
							"Something went wrong! User might not have been removed",
					);
				}
			} else {
				toast.warning(
					"You need to be part of an active workspace to perform this action",
				);
			}
		}
		setRemoveDialogOpen(false);
	};

	return (
		<AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Remove team member?</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to remove {selectedMember?.user?.name} from
						the workspace? They will lose access to all projects and data.
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
	);
}
