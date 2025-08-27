import type { UserTracksAnimeStatus } from "@/app/api/anime-tracks/types";
import type { UserTracksMangaStatus } from "@/app/api/manga-tracks/types";

export type PublicUser = {
	id: string;
	username: string | null;
	displayUsername: string | null;
	image: string | null;
	createdAt: string;
};

export type ProfileAnimeListItem = {
	animeId: number;
	title: string | null;
	images: string | null;
	type: string | null;
	season: string | null;
	year: number | null;
	score: number | null;
	status: UserTracksAnimeStatus | null;
	genres?: string[] | null;
};

export type ProfileMangaListItem = {
	mangaId: number;
	title: string | null;
	images: string | null;
	type: string | null;
	score: number | null;
	status: UserTracksMangaStatus | null;
	genres?: string[] | null;
};

export type ProfileAnimeLists = Record<
	UserTracksAnimeStatus,
	ProfileAnimeListItem[]
>;
export type ProfileMangaLists = Record<
	UserTracksMangaStatus,
	ProfileMangaListItem[]
>;

export type PieDatum = { label: string; value: number };
export type YearSeasonBars = {
	year: number;
	Winter: number;
	Spring: number;
	Summer: number;
	Fall: number;
};
export type HistogramDatum = { label: string; value: number };
export type ScoreHistogramDetailed = { zero: number; half: number }[]; // stars per bin
export type EpisodesHistogramDatum = { label: string; value: number };

export type AnimeOverviewStats = {
	total: number;
	averageScore: number | null;
	statusPie: PieDatum[];
	genresPie: PieDatum[];
	yearSeasonBars: YearSeasonBars[];
	scoreHistogram: HistogramDatum[];
	scoreHistogramDetailed: ScoreHistogramDetailed;
	mostWatchedGenre: string | null;
	topSeasonYear: { season: string; year: number } | null;
	totalEpisodesWatched: number;
	totalSecondsWatched: number;
	episodesWatchedHistogram: EpisodesHistogramDatum[];
	top5ByScore?: { id: number; title: string; images: string; score: number }[];
};

export type MangaOverviewStats = {
	total: number;
	averageScore: number | null;
	statusPie: PieDatum[];
	genresPie: PieDatum[];
	scoreHistogram: HistogramDatum[];
	mostReadGenre: string | null;
	top5ByScore?: { id: number; title: string; images: string; score: number }[];
};
