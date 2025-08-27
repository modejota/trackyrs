"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useCharacterDetails } from "@/app/api/characters/queries";
import { CharacterAppearancesSection } from "@/app/characters/_components/character-appearances-section";
import { CharacterHeroSection } from "@/app/characters/_components/character-hero-section";
import { CharacterVoiceActorsSection } from "@/app/characters/_components/character-voice-actors-section";
import { ErrorBoundary } from "@/components/error-boundary";
import {
	AnimeOrMangaInformationSkeleton,
	AnimeOrMangaTabsSkeleton,
	PeopleOrCharacterHeroSkeleton,
} from "@/components/skeletons/skeleton-components";

function CharacterNotFound() {
	return (
		<div className="container mx-auto px-4 py-16">
			<div className="space-y-6 text-center">
				<div className="space-y-2">
					<h1 className="font-bold text-4xl">404</h1>
					<h2 className="font-semibold text-2xl text-muted-foreground">
						Character Not Found
					</h2>
				</div>

				<p className="mx-auto max-w-md text-muted-foreground">
					The character you're looking for doesn't exist or may have been
					removed. Please check the URL and try again.
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

export default function ClientCharacterDetail({
	characterId,
}: {
	characterId: number;
}) {
	const {
		data: characterData,
		isLoading,
		isError,
	} = useCharacterDetails(characterId);

	if (isLoading) {
		return (
			<main className="container mx-auto px-4 py-8">
				<div className="space-y-8">
					<PeopleOrCharacterHeroSkeleton />
					<AnimeOrMangaInformationSkeleton />
					<AnimeOrMangaTabsSkeleton />
				</div>
			</main>
		);
	}

	if (isError || !characterData) {
		return <CharacterNotFound />;
	}

	return (
		<main className="container mx-auto px-4 py-8">
			<div className="space-y-8">
				<section aria-labelledby="character-hero-heading">
					<ErrorBoundary fallback={<PeopleOrCharacterHeroSkeleton />}>
						<Suspense fallback={<PeopleOrCharacterHeroSkeleton />}>
							<CharacterHeroSection data={characterData.character} />
						</Suspense>
					</ErrorBoundary>
				</section>

				<section aria-labelledby="character-appearances-heading">
					<ErrorBoundary fallback={<AnimeOrMangaInformationSkeleton />}>
						<Suspense fallback={<AnimeOrMangaInformationSkeleton />}>
							<CharacterAppearancesSection
								animeAppearances={characterData.animeAppearances}
								mangaAppearances={characterData.mangaAppearances}
							/>
						</Suspense>
					</ErrorBoundary>
				</section>

				<section aria-labelledby="character-voice-actors-heading">
					<ErrorBoundary fallback={<AnimeOrMangaTabsSkeleton />}>
						<Suspense fallback={<AnimeOrMangaTabsSkeleton />}>
							<CharacterVoiceActorsSection
								voiceActors={characterData.voiceActors}
							/>
						</Suspense>
					</ErrorBoundary>
				</section>
			</div>
		</main>
	);
}
