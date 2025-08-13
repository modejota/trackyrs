"use client";

import { useQuery } from "@tanstack/react-query";
import type { AnimeWithRelations } from "@trackyrs/database/types/anime-with-relations";
import Link from "next/link";
import { Suspense } from "react";
import { AnimeHeroSection } from "@/app/anime/_components/anime-hero-section";
import { AnimeInformationSection } from "@/app/anime/_components/anime-information-section";
import { AnimeTabsSection } from "@/app/anime/_components/anime-tabs-section";
import { ErrorBoundary } from "@/components/error-boundary";
import {
	AnimeOrMangaHeroSkeleton,
	AnimeOrMangaInformationSkeleton,
	AnimeOrMangaInfoSkeleton,
	AnimeOrMangaTabsSkeleton,
} from "@/components/skeletons/skeleton-components";

function useAnimeDetails(animeId: number) {
	return useQuery<AnimeWithRelations>({
		queryKey: ["anime", animeId],
		queryFn: async () => {
			const base = process.env.NEXT_PUBLIC_HONO_SERVER_URL as string;
			const res = await fetch(`${base}/api/anime/${animeId}`);
			if (!res.ok) throw new Error(`Failed to fetch anime: ${res.status}`);
			const json = await res.json();
			if (!json?.success || !json?.data)
				throw new Error("Invalid response shape");
			return json.data as AnimeWithRelations;
		},
		staleTime: 60_000,
		gcTime: 5 * 60_000,
	});
}

function AnimeNotFound() {
	return (
		<div className="container mx-auto px-4 py-16">
			<div className="space-y-6 text-center">
				<div className="space-y-2">
					<h1 className="font-bold text-4xl">404</h1>
					<h2 className="font-semibold text-2xl text-muted-foreground">
						Anime Not Found
					</h2>
				</div>

				<p className="mx-auto max-w-md text-muted-foreground">
					The anime you're looking for doesn't exist or may have been removed.
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

export default function ClientAnimeDetail({ animeId }: { animeId: number }) {
	const {
		data: animeCompleteData,
		isLoading,
		isError,
	} = useAnimeDetails(animeId);

	if (isLoading) {
		return (
			<main className="container mx-auto px-4 py-8">
				<div className="space-y-8">
					<AnimeOrMangaHeroSkeleton />
					<AnimeOrMangaInformationSkeleton />
					<AnimeOrMangaInfoSkeleton />
					<AnimeOrMangaTabsSkeleton />
				</div>
			</main>
		);
	}

	if (isError || !animeCompleteData) {
		return <AnimeNotFound />;
	}

	return (
		<main className="container mx-auto px-4 py-8">
			<div className="space-y-8">
				<section aria-labelledby="anime-hero-heading">
					<ErrorBoundary fallback={<AnimeOrMangaHeroSkeleton />}>
						<Suspense fallback={<AnimeOrMangaHeroSkeleton />}>
							<AnimeHeroSection data={animeCompleteData.anime} />
						</Suspense>
					</ErrorBoundary>
				</section>

				<section aria-labelledby="anime-information-heading">
					<ErrorBoundary fallback={<AnimeOrMangaInformationSkeleton />}>
						<Suspense fallback={<AnimeOrMangaInformationSkeleton />}>
							<AnimeInformationSection anime={animeCompleteData.anime} />
						</Suspense>
					</ErrorBoundary>
				</section>

				<section aria-labelledby="anime-content-heading">
					<ErrorBoundary fallback={<AnimeOrMangaTabsSkeleton />}>
						<Suspense fallback={<AnimeOrMangaTabsSkeleton />}>
							<AnimeTabsSection
								episodes={animeCompleteData.episodes || []}
								characters={animeCompleteData.characters || []}
								staff={animeCompleteData.staff || []}
							/>
						</Suspense>
					</ErrorBoundary>
				</section>
			</div>
		</main>
	);
}
