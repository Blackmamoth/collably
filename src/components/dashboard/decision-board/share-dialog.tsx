import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { SetStateAction } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Send } from "lucide-react";

interface Props {
	shareDialogOpen: boolean;
	setShareDialogOpen: React.Dispatch<SetStateAction<boolean>>;
	projectId: string;
}

export default function DecisionBoardSharedialog({
	shareDialogOpen,
	setShareDialogOpen,
	projectId,
}: Props) {
	return (
		<Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Share Decision Board</DialogTitle>
					<DialogDescription>
						Share this board with your team members
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="share-link">Share Link</Label>
						<div className="flex gap-2">
							<Input
								id={"share-link"}
								value={`https://yourapp.com/board/${projectId}`}
								readOnly
								className="font-mono text-sm"
							/>
							<Button
								variant="outline"
								onClick={() => {
									navigator.clipboard.writeText(
										`https://yourapp.com/board/${projectId}`,
									);
								}}
							>
								Copy
							</Button>
						</div>
					</div>
					<Separator />
					<div className="space-y-2">
						<Label>Invite by Email</Label>
						<div className="flex gap-2">
							<Input placeholder="colleague@example.com" type="email" />
							<Button>
								<Send className="w-4 h-4 mr-2" />
								Invite
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
