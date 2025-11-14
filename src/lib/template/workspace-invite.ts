export function getWorkspaceInviteEmailHtml({
	inviterName,
	workspaceName,
	inviteLink,
}: {
	inviterName?: string;
	workspaceName: string;
	inviteLink: string;
}) {
	return `
<div style="
	margin: 0;
	padding: 40px 0;
	background: #f6f6f6;
	font-family: Arial, sans-serif;
	width: 100%;
	text-align: center;
">
	<div style="
		background: #ffffff;
		border-radius: 10px;
		padding: 40px;
		max-width: 480px;
		margin: 0 auto;
		text-align: center;
	">
		<h1 style="
			margin: 0;
			font-size: 24px;
			font-weight: 600;
			color: #111;
		">
			You’ve been invited to join a workspace on Collably!
		</h1>

		<p style="margin-top: 12px; font-size: 15px; color: #555;">
			${inviterName ? `<strong>${inviterName}</strong> has invited you` : "You’ve been invited"}
			to join the workspace <strong>${workspaceName}</strong> on <strong>Collably</strong>.
		</p>

		<p style="margin-top: 20px; font-size: 15px; color: #555;">
			Collably helps teams collaborate seamlessly on projects — all in one place.
		</p>

		<a href="${inviteLink}" target="_blank" style="
			display: inline-block;
			margin: 32px 0;
			padding: 14px 28px;
			background: #007bff;
			color: #ffffff;
			font-size: 16px;
			font-weight: 600;
			text-decoration: none;
			border-radius: 8px;
		">
			Accept Invitation
		</a>

		<p style="font-size: 14px; color: #777; margin-top: 10px;">
			If the button above doesn’t work, you can open this link in your browser:
		</p>

		<p style="
			font-size: 13px;
			color: #007bff;
			word-break: break-all;
			margin-top: 6px;
		">
			<a href="${inviteLink}" style="color: #007bff;">${inviteLink}</a>
		</p>

		<p style="margin-top: 40px; font-size: 12px; color: #aaa;">
			If you don’t recognize this invitation, you can safely ignore this email.
		</p>
	</div>
</div>
`;
}
