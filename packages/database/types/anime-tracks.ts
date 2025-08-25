export enum UserTracksAnimeStatus {
	WATCHING = "WATCHING",
	COMPLETED = "COMPLETED",
	DROPPED = "DROPPED",
	PAUSED = "PAUSED",
	PLAN_TO_WATCH = "PLAN_TO_WATCH",
	REWATCHING = "REWATCHING",
}

// Type used by repositories when returning grouped anime track items
// Import type-only to avoid runtime cycles
import type { animeTable } from "../schemas/myanimelist/anime/anime-schema";

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
};
