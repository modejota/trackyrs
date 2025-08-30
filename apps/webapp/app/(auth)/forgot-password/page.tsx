import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@trackyrs/ui/components/card";
import type { Metadata } from "next";
import Link from "next/link";
import ForgotPasswordForm from "@/components/auth/forgot-password-form";

export const metadata: Metadata = { title: "Forgot Password" };

export default function ForgotPasswordPage() {
	return (
		<div className="flex h-screen items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
			<div className="w-full max-w-md space-y-8">
				<Card className="border-border">
					<CardHeader className="space-y-1 text-center">
						<CardTitle className="font-semibold text-2xl tracking-tight">
							Reset your password
						</CardTitle>
						<CardDescription>
							Enter your email to get a password reset link
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ForgotPasswordForm />
						<div className="mt-6 text-center">
							<p className="text-muted-foreground text-sm">
								Remembered it?{" "}
								<Link
									href="/login"
									className="rounded-sm font-medium text-primary transition-colors hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
								>
									Back to sign in
								</Link>
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
