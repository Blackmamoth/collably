export function getOtpEmailHtml(otp: string, expiryInMins: number) {
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
		max-width: 420px;
		margin: 0 auto;
		text-align: center;
	">
		<h1 style="
			margin: 0;
			font-size: 24px;
			font-weight: 600;
			color: #111;
		">
			Your Collably Verification Code
		</h1>

		<p style="margin-top: 10px; font-size: 15px; color: #555;">
			We received a request to sign in to your <strong>Collably</strong> account.
			To confirm that this request is actually from you, enter the verification code below.
		</p>

		<div style="
			display: inline-block;
			margin: 32px 0;
			padding: 14px 28px;
			font-size: 32px;
			letter-spacing: 8px;
			font-weight: 700;
			background: #f3f3f3;
			border-radius: 8px;
			border: 1px solid #ddd;
			color: #111;
		">
			${otp}
		</div>

		<p style="font-size: 14px; color: #777; margin: 0;">
			This code is valid for the next ${expiryInMins} minutes.
		</p>

		<p style="margin-top: 18px; font-size: 14px; color: #777;">
			If you're currently trying to sign in to Collably, enter this code in the verification screen to continue.
		</p>

		<p style="margin-top: 40px; font-size: 12px; color: #aaa;">
			If you did not request this, someone else may have entered your email by mistake.
			You can safely ignore this message — no further action is required.
		</p>
	</div>
</div>
`;
}
