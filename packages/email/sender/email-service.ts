import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import nodemailer from "nodemailer";
import type { ResetPasswordProps } from "./auth-types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, "../.env.local"), override: true, quiet: true });

export class EmailService {
	private static transporter: nodemailer.Transporter | null = null;

	private static getTransporter(): nodemailer.Transporter {
		if (!EmailService.transporter) {
			const config = {
				host: process.env.EMAIL_PROVIDER,
				port: 465,
				secure: true,
				auth: {
					user: process.env.EMAIL_USER,
					pass: process.env.EMAIL_PASSWORD,
				},
			};

			EmailService.transporter = nodemailer.createTransport(config);
		}

		return EmailService.transporter;
	}

	static async sendPasswordResetEmail({
		user,
		url,
		token,
	}: ResetPasswordProps) {
		try {
			const resetLink = `${url}?token=${token}`;
			// This was proposed to use react-email. It used to work but is broken in new versions, awaiting for a fix.
			const emailHtmlBasic = `<!doctype html>
				<html>
					<body style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: #111; line-height: 1.5;">
						<h2 style="margin: 0 0 12px;">Reset your Trackyrs password</h2>
						<p style="margin: 0 0 16px;">Hi ${user.username},</p>
						<p style="margin: 0 0 16px;">Click the button below to reset your password:</p>
						<p style="margin: 24px 0;">
							<a href="${resetLink}" target="_blank" rel="noopener noreferrer" style="background: #111; color: #fff; padding: 12px 16px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset password</a>
						</p>
						<p style="margin: 0 0 8px;">Or copy and paste this link into your browser:</p>
						<p style="margin: 0;"><a href="${resetLink}" target="_blank" rel="noopener noreferrer">${resetLink}</a></p>
					</body>
				</html>`;

			const mailOptions = {
				from: process.env.EMAIL_USER,
				to: user.email,
				subject: "Trackyrs - Password reset",
				html: emailHtmlBasic,
				text: `Reset your Trackyrs password:\n\n<${resetLink}>\n\nIf it doesn't open, copy and paste this link into your browser:\n${resetLink}`,
			};

			await EmailService.getTransporter().sendMail(mailOptions);
		} catch (error) {
			throw error;
		}
	}
}
