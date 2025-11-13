import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { SetStateAction } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import * as z from "zod";
import { useForm } from "@tanstack/react-form";
import { authClient } from "@/lib/auth-client";
import { generateSlug } from "@/lib/common/helper";
import { toast } from "sonner";
import { Checkbox } from "../ui/checkbox";

interface Props {
	isCreateWorkspaceOpen: boolean;
	setIsCreateWorkspaceOpen: React.Dispatch<SetStateAction<boolean>>;
	userId: string;
}

const schema = z.object({
	name: z.string().min(1, "name is required"),
	switchWorkspace: z.boolean(),
});

export default function CreateWorkSpaceDialog({
	isCreateWorkspaceOpen,
	setIsCreateWorkspaceOpen,
	userId,
}: Props) {
	const form = useForm({
		defaultValues: {
			name: "",
			switchWorkspace: false,
		},
		validators: {
			onChange: schema,
		},
		onSubmit: async ({ value }) => {
			const { data, error } = await authClient.organization.create({
				name: value.name,
				slug: generateSlug(value.name),
				userId: userId,
			});

			if (error !== null) {
				toast.error(
					error.message ||
						"Something went wrong, new workspace could not be created!",
				);
				return;
			}

			if (value.switchWorkspace && data !== undefined) {
				await authClient.organization.setActive({ organizationId: data.id });
			}

			setIsCreateWorkspaceOpen(false);
			form.reset();
		},
	});

	return (
		<Dialog
			open={isCreateWorkspaceOpen}
			onOpenChange={setIsCreateWorkspaceOpen}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create Workspace</DialogTitle>
					<DialogDescription>
						Create a new workspace to organize your projects and collaborate
						with your team.
					</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
				>
					<form.Field name="name">
						{(field) => (
							<div className="space-y-4 py-4">
								<div className="space-y-2">
									<Label htmlFor="workspace-name">Workspace Name</Label>
									<Input
										id={"workspace-name"}
										placeholder="Enter workspace name"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
									{field.state.meta.errors.length > 0 &&
										field.state.meta.isDirty && (
											<p className="text-sm text-destructive">
												{field.state.meta.errors[0]?.message}
											</p>
										)}
								</div>
							</div>
						)}
					</form.Field>

					<form.Field name="switchWorkspace">
						{(field) => (
							<div className="flex items-center space-x-2">
								<Checkbox
									id={"switch-workspace"}
									defaultChecked={false}
									checked={field.state.value}
									onCheckedChange={(checked) =>
										field.handleChange(checked === true)
									}
								/>
								<Label
									htmlFor="switch-workspace"
									className="text-sm font-normal cursor-pointer"
								>
									Switch to this workspace after creating
								</Label>
								{field.state.meta.errors.length > 0 &&
									field.state.meta.isDirty && (
										<p className="text-sm text-destructive">
											{field.state.meta.errors[0]?.message}
										</p>
									)}
							</div>
						)}
					</form.Field>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsCreateWorkspaceOpen(false)}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={form.getAllErrors().form.errors.length > 0}
						>
							Create Workspace
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
