import type { animeTable } from "../schemas/myanimelist/anime/anime-schema";

export enum UserTracksAnimeStatus {
	WATCHING = "WATCHING",
	COMPLETED = "COMPLETED",
	DROPPED = "DROPPED",
	PAUSED = "PAUSED",
	PLAN_TO_WATCH = "PLAN_TO_WATCH",
	REWATCHING = "REWATCHING",
}

export type UserTracksAnimeGroupedItem = {
	animeId: number;
	title: string | null;
	images: string | null;
	type: typeof animeTable.$inferSelect.type;
	season: typeof animeTable.$inferSelect.season;
	year: number | null;
	score: number | null;
	status: string | null;
	genres: string[] | null;
	episodesWatched?: number | null;
	duration?: number | null; // seconds per episode
	numberEpisodes?: number | null;
};
