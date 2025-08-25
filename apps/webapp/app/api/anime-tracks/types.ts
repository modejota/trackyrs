export enum UserTracksAnimeStatus {
	WATCHING = "WATCHING",
	COMPLETED = "COMPLETED",
	DROPPED = "DROPPED",
	PAUSED = "PAUSED",
	PLAN_TO_WATCH = "PLAN_TO_WATCH",
	REWATCHING = "REWATCHING",
}

export interface CreateAnimeTrackRequest {
	status?: UserTracksAnimeStatus;
	score?: number;
	episodesWatched?: number;
	startDate?: string;
	endDate?: string;
	rewatches?: number;
}

export interface CreateAnimeTrackResponse {
	success: boolean;
	data?: {
		track: {
			id: number;
			animeId: number;
			userId: string;
			status: UserTracksAnimeStatus | null;
			score: number | null;
			episodesWatched: number | null;
			startDate?: string | null;
			endDate?: string | null;
			rewatches?: number | null;
		};
	};
	message?: string;
}
