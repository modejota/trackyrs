"use client";

import { useQuery } from "@tanstack/react-query";
import type { Anime } from "@trackyrs/database/schemas/myanimelist/anime/anime-schema";
import type { Manga } from "@trackyrs/database/schemas/myanimelist/manga/manga-schema";
import { useTopAnime } from "@/app/api/anime/queries";
import { useOngoingManga, useTopManga } from "@/app/api/manga/queries";
import { LandingCollapsableSection } from "@/components/landing-collapsable-section";
import {
	getCurrentSeasonAndYear,
	getNextSeasonAndYear,
	SEASON_LABELS,
} from "@/lib/season-utils";

interface SeasonApiResponse {
	success: boolean;
	data: {
		animes: Anime[];
		season: string;
		year: number;
	};
}

function useCurrentSeasonAnime() {
	const { season, year } = getCurrentSeasonAndYear();

	return useQuery<{ animes: Anime[]; season: string; year: number }>({
		queryKey: ["anime", "season", "current", season, year],
		queryFn: async () => {
			const base = process.env.NEXT_PUBLIC_HONO_SERVER_URL as string;
			const url = `${base}/api/anime/season?season=${encodeURIComponent(season)}&year=${encodeURIComponent(String(year))}`;
			const res = await fetch(url);
			if (!res.ok)
				throw new Error(`Failed to fetch current season: ${res.status}`);
			const json: SeasonApiResponse = await res.json();
			if (!json?.success || !json?.data)
				throw new Error("Invalid response shape");
			return json.data;
		},
		staleTime: 60 * 60 * 1000, // 1 hour
		gcTime: 5 * 60 * 60 * 1000, // 5 hours
	});
}

function useNextSeasonAnime() {
	const { season, year } = getNextSeasonAndYear();

	return useQuery<{ animes: Anime[]; season: string; year: number }>({
		queryKey: ["anime", "season", "next", season, year],
		queryFn: async () => {
			const base = process.env.NEXT_PUBLIC_HONO_SERVER_URL as string;
			const url = `${base}/api/anime/season?season=${encodeURIComponent(season)}&year=${encodeURIComponent(String(year))}`;
			const res = await fetch(url);
			if (!res.ok)
				throw new Error(`Failed to fetch next season: ${res.status}`);
			const json: SeasonApiResponse = await res.json();
			if (!json?.success || !json?.data)
				throw new Error("Invalid response shape");
			return json.data;
		},
		staleTime: 60 * 60 * 1000, // 1 hour
		gcTime: 5 * 60 * 60 * 1000, // 5 hours
	});
}

export default function LandingClient() {
	const currentSeasonQuery = useCurrentSeasonAnime();
	const nextSeasonQuery = useNextSeasonAnime();
	const topAnimeQuery = useTopAnime();
	const topMangaQuery = useTopManga();
	const ongoingMangaQuery = useOngoingManga();

	const currentSeason = getCurrentSeasonAndYear();
	const nextSeason = getNextSeasonAndYear();

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
