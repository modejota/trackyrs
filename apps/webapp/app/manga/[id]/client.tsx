"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useMangaDetails } from "@/app/api/manga/queries";
import { MangaHeroSection } from "@/app/manga/_components/manga-hero-section";
import { MangaInformationSection } from "@/app/manga/_components/manga-information-section";
import { MangaTabsSection } from "@/app/manga/_components/manga-tabs-section";
import { ErrorBoundary } from "@/components/error-boundary";
import {
	AnimeOrMangaHeroSkeleton,
	AnimeOrMangaInformationSkeleton,
	AnimeOrMangaInfoSkeleton,
	AnimeOrMangaTabsSkeleton,
} from "@/components/skeletons/skeleton-components";

function MangaNotFound() {
	return (
		<div className="container mx-auto px-4 py-16">
			<div className="space-y-6 text-center">
				<div className="space-y-2">
					<h1 className="font-bold text-4xl">404</h1>
					<h2 className="font-semibold text-2xl text-muted-foreground">
						Manga Not Found
					</h2>
				</div>

				<p className="mx-auto max-w-md text-muted-foreground">
					The manga you're looking for doesn't exist or may have been removed.
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

export default function ClientMangaDetail({ mangaId }: { mangaId: number }) {
	const {
		data: mangaCompleteData,
		isLoading,
		isError,
	} = useMangaDetails(mangaId);

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

	if (isError || !mangaCompleteData) {
		return <MangaNotFound />;
	}

	return (
		<main className="container mx-auto px-4 py-8">
			<div className="space-y-8">
				<section aria-labelledby="manga-hero-heading">
					<ErrorBoundary fallback={<AnimeOrMangaHeroSkeleton />}>
						<Suspense fallback={<AnimeOrMangaHeroSkeleton />}>
							<MangaHeroSection data={mangaCompleteData.manga} />
						</Suspense>
					</ErrorBoundary>
				</section>

				<section aria-labelledby="manga-information-heading">
					<ErrorBoundary fallback={<AnimeOrMangaInformationSkeleton />}>
						<Suspense fallback={<AnimeOrMangaInformationSkeleton />}>
							<MangaInformationSection manga={mangaCompleteData.manga} />
						</Suspense>
					</ErrorBoundary>
				</section>

				<section aria-labelledby="manga-content-heading">
					<ErrorBoundary fallback={<AnimeOrMangaTabsSkeleton />}>
						<Suspense fallback={<AnimeOrMangaTabsSkeleton />}>
							<MangaTabsSection
								characters={mangaCompleteData.characters || []}
								staff={mangaCompleteData.staff || []}
							/>
						</Suspense>
					</ErrorBoundary>
				</section>
			</div>
		</main>
	);
}
