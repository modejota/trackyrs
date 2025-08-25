"use client";

import { useSeasonalAnime, useTopAnime } from "@/app/api/anime/queries";
import { useOngoingManga, useTopManga } from "@/app/api/manga/queries";
import { LandingCollapsableSection } from "@/components/landing-collapsable-section";
import {
	getCurrentSeasonAndYear,
	getNextSeasonAndYear,
	SEASON_LABELS,
} from "@/lib/season-utils";

export default function LandingClient() {
	const currentSeason = getCurrentSeasonAndYear();
	const nextSeason = getNextSeasonAndYear();

	const currentSeasonQuery = useSeasonalAnime(
		currentSeason.season,
		currentSeason.year,
	);
	const nextSeasonQuery = useSeasonalAnime(nextSeason.season, nextSeason.year);
	const topAnimeQuery = useTopAnime();
	const topMangaQuery = useTopManga();
	const ongoingMangaQuery = useOngoingManga();

	return (
		<div className="space-y-6">
			{/* Current Season Anime */}
			<LandingCollapsableSection
				title={`${SEASON_LABELS[currentSeason.season]} ${currentSeason.year} Anime`}
				subtitle="Currently airing this season"
				items={currentSeasonQuery.data?.animes ?? []}
				isLoading={currentSeasonQuery.isLoading}
				itemType="anime"
			/>

			{/* Next Season Anime */}
			<LandingCollapsableSection
				title={`${SEASON_LABELS[nextSeason.season]} ${nextSeason.year} Anime`}
				subtitle="Upcoming next season"
				items={nextSeasonQuery.data?.animes ?? []}
				isLoading={nextSeasonQuery.isLoading}
				itemType="anime"
			/>

			{/* Top Anime */}
			<LandingCollapsableSection
				title="Top Anime"
				subtitle="Highest rated series"
				items={topAnimeQuery.data?.animes ?? []}
				isLoading={topAnimeQuery.isLoading}
				itemType="anime"
				showRanking={true}
			/>

			{/* Ongoing Manga */}
			<LandingCollapsableSection
				title="Ongoing Manga"
				subtitle="Currently publishing series"
				items={ongoingMangaQuery.data?.mangas ?? []}
				isLoading={ongoingMangaQuery.isLoading}
				itemType="manga"
			/>

			{/* Top Manga */}
			<LandingCollapsableSection
				title="Top Manga"
				subtitle="Highest rated series"
				items={topMangaQuery.data?.mangas ?? []}
				isLoading={topMangaQuery.isLoading}
				itemType="manga"
				showRanking={true}
			/>
		</div>
	);
}
