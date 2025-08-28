import { Skeleton } from "@trackyrs/ui/components/skeleton";
import { generateArray } from "@trackyrs/utils/src/react-list-key-generator";
import type { Metadata } from "next";
import { Suspense } from "react";
import { CardSkeleton } from "@/components/skeletons/card-skeleton";
import LandingClient from "./landing-client";

export const metadata: Metadata = {
	title: "Home",
};

function LandingSkeleton() {
	return (
		<div className="space-y-6">
			{generateArray("top-anime-card", 5).map((outerKey) => (
				<div key={outerKey} className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<Skeleton className="h-8 w-48" />
							<Skeleton className="mt-2 h-4 w-32" />
						</div>
					</div>
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
						{generateArray("landing-skeleton-", 6).map((key) => (
							<CardSkeleton key={`${outerKey}-${key}`} />
						))}
					</div>
				</div>
			))}
		</div>
	);
}

export default function Home() {
	return (
		<main className="container mx-auto px-4 py-8">
			<div className="mb-10">
				<h1 className="font-bold text-4xl">Welcome to Trackyrs</h1>
				<p className="text-muted-foreground text-xl">
					Discover and track your favorite anime and manga series
				</p>
			</div>

			<Suspense fallback={<LandingSkeleton />}>
				<LandingClient />
			</Suspense>
		</main>
	);
}
