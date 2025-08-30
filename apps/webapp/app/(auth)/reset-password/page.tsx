import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@trackyrs/ui/components/card";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ResetPasswordForm from "@/components/auth/reset-password-form";

interface Props {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const metadata: Metadata = { title: "Reset Password" };

export default async function ResetPasswordPage({ searchParams }: Props) {
	const params = await searchParams;
	const token = params.token;
	const error = params.error;

	if (!token || error) {
		redirect("/");
	}

	return (
		<div className="flex h-screen items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
			<div className="w-full max-w-md space-y-8">
				<Card className="border-border">
					<CardHeader className="space-y-1 text-center">
						<CardTitle className="font-semibold text-2xl tracking-tight">
							Choose a new password
						</CardTitle>
						<CardDescription>Enter your new password below</CardDescription>
					</CardHeader>
					<CardContent>
						<ResetPasswordForm token={token as string} />
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
