export enum UserTracksMangaStatus {
	READING = "READING",
	COMPLETED = "COMPLETED",
	DROPPED = "DROPPED",
	PAUSED = "PAUSED",
	PLAN_TO_READ = "PLAN_TO_READ",
	REREADING = "REREADING",
}

// Type used by repositories when returning grouped manga track items
// Import type-only to avoid runtime cycles
import type { mangaTable } from "../schemas/myanimelist/manga/manga-schema";

export type UserTracksMangaGroupedItem = {
	mangaId: number;
	title: string | null;
	images: string | null;
	type: typeof mangaTable.$inferSelect.type;
	score: number | null;
	status: string | null;
	genres: string[] | null;
};
