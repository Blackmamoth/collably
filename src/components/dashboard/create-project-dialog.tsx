import type { SetStateAction } from "react";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";

interface Props {
	currentWorkspaceId?: string;
	isCreateProjectOpen: boolean;
	setIsCreateProjectOpen: React.Dispatch<SetStateAction<boolean>>;
}

const schema = z.object({
	name: z.string().min(1, "name is required"),
	description: z.string().or(z.literal("")),
});

export default function CreateProjectDialog({
	currentWorkspaceId,
	isCreateProjectOpen,
	setIsCreateProjectOpen,
}: Props) {
	const createProject = useMutation(api.project.createProject);

	const form = useForm({
		defaultValues: {
			name: "",
			description: "",
		},
		validators: {
			onChange: schema,
		},
		onSubmit: async ({ value }) => {
			if (!currentWorkspaceId) {
				toast.warning(
					"You need to select a workspace before creating a project",
				);
				return;
			}
			await createProject({
				name: value.name,
				workspaceId: currentWorkspaceId,
				description: value.description,
			});
			setIsCreateProjectOpen(false);
			form.reset();
		},
	});

	return (
		<Dialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New Project</DialogTitle>
					<DialogDescription>
						Give your project a name to get started. Both Decision Board and
						Task Board will be available.
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
									<Label htmlFor="project-name">Project Name</Label>
									<Input
										id={"project-name"}
										placeholder="Enter project name"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
								</div>
							</div>
						)}
					</form.Field>
					<form.Field name="description">
						{(field) => (
							<div className="space-y-4 py-4">
								<div className="space-y-2">
									<Label htmlFor="project-description">
										Description (optional)
									</Label>
									<Textarea
										id={"project-description"}
										placeholder="What's this project about?"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
								</div>
							</div>
						)}
					</form.Field>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsCreateProjectOpen(false)}
						>
							Cancel
						</Button>
						<Button type="submit">Create Project</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
