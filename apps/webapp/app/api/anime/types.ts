import type { Anime } from "@trackyrs/database/schemas/myanimelist/anime/anime-schema";
import type {
	AnimeStatus,
	AnimeType,
	Season,
} from "@trackyrs/database/types/anime-with-relations";

export interface AnimeSeasonApiEnvelope {
	success: boolean;
	data: {
		animes: AnimeListItem[];
		season: Season;
		year: number;
	};
}

export interface AnimeTopApiEnvelope {
	success: boolean;
	data: {
		animes: AnimeListItem[];
		page: number;
		limit: number;
		total: number;
		hasMore: boolean;
	};
}

export interface AvailableAnimeYearsApiEnvelope {
	success: boolean;
	data: { years: number[] };
}

export interface AnimeSearchCriteria {
	title?: string;
	genres?: string[];
	years?: number[];
	seasons?: Season[];
	types?: AnimeType[];
	statuses?: AnimeStatus[];
}

export interface AnimeSearchResponse {
	success: boolean;
	data: {
		animes: AnimeListItem[];
		page: number;
		limit: number;
		total: number;
		hasMore: boolean;
	};
}

export type AnimeListItem = Anime & {
	userTrackStatus?: string | null;
	userTrackScore?: number | null;
	userTrackEpisodesWatched?: number | null;
};
