export enum UserTracksMangaStatus {
	READING = "READING",
	COMPLETED = "COMPLETED",
	DROPPED = "DROPPED",
	PAUSED = "PAUSED",
	PLAN_TO_READ = "PLAN_TO_READ",
	REREADING = "REREADING",
}

export interface CreateMangaTrackRequest {
	status?: UserTracksMangaStatus;
	score?: number;
	chaptersRead?: number;
	startDate?: string;
	endDate?: string;
	rereads?: number;
}

export interface CreateMangaTrackResponse {
	success: boolean;
	data?: {
		track: {
			id: number;
			mangaId: number;
			userId: string;
			status: UserTracksMangaStatus | null;
			score: number | null;
			chaptersRead: number | null;
			startDate?: string | null;
			endDate?: string | null;
			rereads?: number | null;
		} | null;
	};
	message?: string;
}
