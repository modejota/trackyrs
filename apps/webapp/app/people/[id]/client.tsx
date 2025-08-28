"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { usePeopleDetails } from "@/app/api/people/queries";
import { PeopleContributionsSection } from "@/app/people/_components/people-contributions-section";
import { PeopleHeroSection } from "@/app/people/_components/people-hero-section";
import { ErrorBoundary } from "@/components/error-boundary";
import {
	AnimeOrMangaTabsSkeleton,
	PeopleOrCharacterHeroSkeleton,
} from "@/components/skeletons/skeleton-components";

function PeopleNotFound() {
	return (
		<div className="container mx-auto px-4 py-16">
			<div className="space-y-6 text-center">
				<div className="space-y-2">
					<h1 className="font-bold text-4xl">404</h1>
					<h2 className="font-semibold text-2xl text-muted-foreground">
						Person Not Found
					</h2>
				</div>

				<p className="mx-auto max-w-md text-muted-foreground">
					The person you're looking for doesn't exist or may have been removed.
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

export default function ClientPeopleDetail({ peopleId }: { peopleId: number }) {
	const { data, isLoading, isError } = usePeopleDetails(peopleId);

	useEffect(() => {
		if (isLoading) {
			document.title = "Trackyrs | Person";
			return;
		}
		const name = data?.people?.name;
		document.title = name ? `Trackyrs | ${name}` : "Trackyrs | Person";
		return () => {
			document.title = "Trackyrs";
		};
	}, [data, isLoading]);

	if (isLoading) {
		return (
			<main className="container mx-auto px-4 py-8">
				<div className="space-y-8">
					<PeopleOrCharacterHeroSkeleton />
					<AnimeOrMangaTabsSkeleton />
				</div>
			</main>
		);
	}

	if (isError || !data) {
		return <PeopleNotFound />;
	}

	return (
		<main className="container mx-auto px-4 py-8">
			<div className="space-y-8">
				<section aria-labelledby="people-hero-heading">
					<ErrorBoundary fallback={<PeopleOrCharacterHeroSkeleton />}>
						<Suspense fallback={<PeopleOrCharacterHeroSkeleton />}>
							<PeopleHeroSection data={data.people} />
						</Suspense>
					</ErrorBoundary>
				</section>

				<section aria-labelledby="people-contributions-heading">
					<ErrorBoundary fallback={<AnimeOrMangaTabsSkeleton />}>
						<Suspense fallback={<AnimeOrMangaTabsSkeleton />}>
							<PeopleContributionsSection
								animeStaff={data.animeStaff}
								mangaStaff={data.mangaStaff}
								voiceActing={data.voiceActing}
							/>
						</Suspense>
					</ErrorBoundary>
				</section>
			</div>
		</main>
	);
}
