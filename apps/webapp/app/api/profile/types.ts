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
