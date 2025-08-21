import type { Manga } from "@trackyrs/database/schemas/myanimelist/manga/manga-schema";
import type {
	MangaStatus,
	MangaType,
} from "@trackyrs/database/types/manga-with-relations";

export interface MangaTopApiEnvelope {
	success: boolean;
	data: {
		mangas: Manga[];
		page: number;
		limit: number;
		total: number;
		hasMore: boolean;
	};
}

export interface MangaOngoingApiEnvelope {
	success: boolean;
	data: {
		mangas: Manga[];
		page: number;
		limit: number;
		total: number;
		hasMore: boolean;
	};
}

export interface MangaSearchCriteria {
	title?: string;
	genres?: string[];
	years?: number[];
	types?: MangaType[];
	statuses?: MangaStatus[];
}

export interface MangaSearchResponse {
	success: boolean;
	data: {
		mangas: Manga[];
		page: number;
		limit: number;
		total: number;
		hasMore: boolean;
	};
}
