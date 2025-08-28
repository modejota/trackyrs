import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@trackyrs/ui/components/card";
import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Register" };

export default function RegisterPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
			<div className="w-full max-w-md space-y-8">
				<Card className="border-border">
					<CardHeader className="space-y-1 text-center">
						<CardTitle className="font-semibold text-2xl tracking-tight">
							Create your account
						</CardTitle>
						<CardDescription>
							Join Trackyrs to start tracking your favorite anime and manga
						</CardDescription>
					</CardHeader>
					<CardContent>
						<RegisterForm />
						<div className="mt-6 text-center">
							<p className="text-muted-foreground text-sm">
								Already have an account?{" "}
								<Link
									href="/login"
									className="rounded-sm font-medium text-primary transition-colors hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
								>
									Sign in here
								</Link>
							</p>
						</div>
					</CardContent>
				</Card>

				<div className="text-center">
					<p className="text-muted-foreground text-xs">
						By creating an account, you agree to our terms of service and
						privacy policy.
					</p>
				</div>
			</div>
		</div>
	);
}
