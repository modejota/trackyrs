import type { Metadata } from "next";

export const metadata: Metadata = { title: "Not Found" };

import Link from "next/link";

export default function NotFound() {
	return (
		<div className="container mx-auto px-4 py-16">
			<div className="space-y-6 text-center">
				<div className="space-y-2">
					<h1 className="font-bold text-4xl">404</h1>
					<h2 className="font-semibold text-2xl text-muted-foreground">
						Page Not Found
					</h2>
				</div>

				<p className="mx-auto max-w-md text-muted-foreground">
					The page you're looking for doesn't exist or may have been moved.
					Please check the URL and try again.
				</p>

				<div className="flex flex-col justify-center gap-4 sm:flex-row">
					<Link
						href="/"
						className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90"
					>
						Go Home
					</Link>
				</div>
			</div>
		</div>
	);
}
