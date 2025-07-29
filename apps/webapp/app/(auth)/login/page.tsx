import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@trackyrs/ui/components/card";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
			<div className="w-full max-w-md space-y-8">
				<Card className="border-border">
					<CardHeader className="space-y-1 text-center">
						<CardTitle className="font-semibold text-2xl tracking-tight">
							Welcome back to Trackyrs
						</CardTitle>
						<CardDescription>
							Sign in to your account to continue
						</CardDescription>
					</CardHeader>
					<CardContent>
						<LoginForm />
						<div className="mt-6 text-center">
							<p className="text-muted-foreground text-sm">
								Don't have an account?{" "}
								<Link
									href="/register"
									className="rounded-sm font-medium text-primary transition-colors hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
								>
									Create one here
								</Link>
							</p>
						</div>
					</CardContent>
				</Card>

				<div className="text-center">
					<p className="text-muted-foreground text-xs">
						By signing in, you agree to our terms of service and privacy policy.
					</p>
				</div>
			</div>
		</div>
	);
}
