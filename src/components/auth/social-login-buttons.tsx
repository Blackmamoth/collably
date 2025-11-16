import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RiGithubLine, RiGoogleFill } from "react-icons/ri";
import { handleSocialLogin } from "@/lib/common/helper";

export function SocialLoginButtons() {
	return (
		<>
			<div className="relative my-6">
				<Separator />
				<span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
					or continue with
				</span>
			</div>

			<div className="grid grid-cols-2 gap-3">
				<Button
					variant="outline"
					className="h-10 bg-transparent"
					onClick={() => handleSocialLogin("google")}
				>
					<RiGoogleFill className="w-4 h-4" />
					Google
				</Button>
				<Button
					variant="outline"
					className="h-10 bg-transparent"
					onClick={() => handleSocialLogin("github")}
				>
					<RiGithubLine className="w-4 h-4" />
					GitHub
				</Button>
			</div>
		</>
	);
}

