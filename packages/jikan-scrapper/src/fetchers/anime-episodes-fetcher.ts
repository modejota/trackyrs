import AnimeEpisodeRepository from "@trackyrs/database/repositories/myanimelist/anime/anime-episode-repository";
import AnimeRepository from "@trackyrs/database/repositories/myanimelist/anime/anime-repository";
import type { NewAnimeEpisode } from "@trackyrs/database/schemas/myanimelist/anime/anime-episode-schema";
import { BaseFetcher } from "@/base-fetcher";
import { FetcherError, FetcherErrorType } from "@/fetcher-error";
import { AnimeMapper } from "@/mappers/anime-mapper";
import type {
	AnimeEpisodesResponse,
	DatabaseOperationResult,
	EpisodeData,
} from "@/types";

export class AnimeEpisodesFetcher extends BaseFetcher {
	async insertAll(): Promise<DatabaseOperationResult> {
		return this.insertRange(1);
	}

	async updateAll(): Promise<DatabaseOperationResult> {
		return this.updateRange(1);
	}

	async insertSingle(animeId: number): Promise<DatabaseOperationResult> {
		return this.processSingleAnime(animeId, false);
	}

	async updateSingle(animeId: number): Promise<DatabaseOperationResult> {
		return this.processSingleAnime(animeId, true);
	}

	async insertRange(startId?: number): Promise<DatabaseOperationResult> {
		const animeIds = await this.getAnimeIdsFromRange(startId);
		return this.processAnimeIdList(animeIds, false);
	}

	async updateRange(startId?: number): Promise<DatabaseOperationResult> {
		const animeIds = await this.getAnimeIdsFromRange(startId);
		return this.processAnimeIdList(animeIds, true);
	}

	async insertBetween(
		startId: number,
		endId: number,
	): Promise<DatabaseOperationResult> {
		if (startId > endId) {
			throw new FetcherError(
				FetcherErrorType.VALIDATION_ERROR,
				`Start ID (${startId}) cannot be greater than end ID (${endId})`,
			);
		}
		const animeIds = await this.getAnimeIdsBetween(startId, endId);
		return this.processAnimeIdList(animeIds, false);
	}

	async updateBetween(
		startId: number,
		endId: number,
	): Promise<DatabaseOperationResult> {
		if (startId > endId) {
			throw new FetcherError(
				FetcherErrorType.VALIDATION_ERROR,
				`Start ID (${startId}) cannot be greater than end ID (${endId})`,
			);
		}
		const animeIds = await this.getAnimeIdsBetween(startId, endId);
		return this.processAnimeIdList(animeIds, true);
	}

	async insertFromList(ids: number[]): Promise<DatabaseOperationResult> {
		return this.processAnimeIdList(ids, false);
	}

	async updateFromList(ids: number[]): Promise<DatabaseOperationResult> {
		return this.processAnimeIdList(ids, true);
	}

	private async processSingleAnime(
		animeId: number,
		isUpdate: boolean,
	): Promise<DatabaseOperationResult> {
		try {
			return await this.processAnimeEpisodes(animeId, isUpdate);
		} catch (error) {
			if (error instanceof FetcherError) {
				throw error;
			}
			throw new FetcherError(
				FetcherErrorType.UNKNOWN_ERROR,
				`Failed to ${isUpdate ? "update" : "insert"} episodes for anime ${animeId}`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	}

	private async processAnimeIdList(
		animeIds: number[],
		isUpdate: boolean,
	): Promise<DatabaseOperationResult> {
		if (animeIds.length === 0) {
			return { inserted: 0, updated: 0, skipped: 0, errors: 0 };
		}
		this.resetProgress();
		this.operationProgress.total = animeIds.length;
		this.progressBar.start(animeIds.length, 0);

		const totalResult: DatabaseOperationResult = {
			inserted: 0,
			updated: 0,
			skipped: 0,
			errors: 0,
		};

		for (const animeId of animeIds) {
			try {
				const result = await this.processAnimeEpisodes(animeId, isUpdate);
				totalResult.inserted += result.inserted;
				totalResult.updated += result.updated;
				totalResult.skipped += result.skipped;
				totalResult.errors += result.errors;
			} catch (error) {
				totalResult.errors++;
				console.warn(`Error processing episodes for anime ${animeId}:`, error);
			}

			this.operationProgress.processed++;
			this.operationProgress.inserted = totalResult.inserted;
			this.operationProgress.updated = totalResult.updated;
			this.operationProgress.skipped = totalResult.skipped;
			this.operationProgress.errors = totalResult.errors;
			this.progressBar.update(this.operationProgress.processed);
		}

		this.progressBar.stop();
		return totalResult;
	}

	private async processAnimeEpisodes(
		animeId: number,
		isUpdate: boolean,
	): Promise<DatabaseOperationResult> {
		try {
			let currentPage = 1;
			let hasNextPage = true;
			const totalResult: DatabaseOperationResult = {
				inserted: 0,
				updated: 0,
				skipped: 0,
				errors: 0,
			};

			while (hasNextPage) {
				const episodesData = await this.fetchJson<AnimeEpisodesResponse>(
					`${this.baseUrl}/anime/${animeId}/episodes?page=${currentPage}`,
				);

				if (
					!episodesData ||
					!episodesData.data ||
					episodesData.data.length === 0
				) {
					hasNextPage = false;
					continue;
				}

				const pageResult = await this.processEpisodesPage(
					animeId,
					episodesData.data,
					isUpdate,
				);

				totalResult.inserted += pageResult.inserted;
				totalResult.updated += pageResult.updated;
				totalResult.skipped += pageResult.skipped;
				totalResult.errors += pageResult.errors;

				hasNextPage = episodesData.pagination?.has_next_page === true;
				currentPage++;
			}

			return totalResult;
		} catch (error) {
			if (error instanceof FetcherError) {
				throw error;
			}
			return { inserted: 0, updated: 0, skipped: 0, errors: 1 };
		}
	}

	private async processEpisodesPage(
		animeId: number,
		episodes: EpisodeData[],
		isUpdate: boolean,
	): Promise<DatabaseOperationResult> {
		const result: DatabaseOperationResult = {
			inserted: 0,
			updated: 0,
			skipped: 0,
			errors: 0,
		};

		const episodesToInsert: NewAnimeEpisode[] = [];
		const episodesToUpdate: Array<{
			episodeNumber: number;
			data: Partial<NewAnimeEpisode>;
		}> = [];

		for (const episodeData of episodes) {
			try {
				const mappedEpisode = AnimeMapper.mapEpisodeData(animeId, episodeData);

				const existingEpisode =
					await AnimeEpisodeRepository.findByAnimeIdAndEpisodeNumber(
						animeId,
						episodeData.mal_id,
					);

				if (existingEpisode) {
					if (isUpdate) {
						episodesToUpdate.push({
							episodeNumber: episodeData.mal_id,
							data: mappedEpisode,
						});
					} else {
						result.skipped++;
					}
				} else {
					episodesToInsert.push(mappedEpisode);
				}
			} catch (error) {
				result.errors++;
				console.warn(
					`Error processing episode ${episodeData.mal_id} for anime ${animeId}:`,
					error,
				);
			}
		}

		if (episodesToInsert.length > 0) {
			try {
				const insertResult =
					await AnimeEpisodeRepository.insertMany(episodesToInsert);
				result.inserted += insertResult.rowCount || 0;
			} catch (error) {
				result.errors += episodesToInsert.length;
				console.warn(
					`Error batch inserting episodes for anime ${animeId}:`,
					error,
				);
			}
		}

		for (const { episodeNumber, data } of episodesToUpdate) {
			try {
				await AnimeEpisodeRepository.update(animeId, episodeNumber, data);
				result.updated++;
			} catch (error) {
				result.errors++;
				console.warn(
					`Error updating episode ${episodeNumber} for anime ${animeId}:`,
					error,
				);
			}
		}

		return result;
	}

	private async getAnimeIdsFromRange(startId?: number): Promise<number[]> {
		try {
			return await AnimeRepository.findIdsFromRange(startId);
		} catch (error) {
			throw new FetcherError(
				FetcherErrorType.DATABASE_ERROR,
				`Failed to get anime IDs from range starting at ${startId}`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	}

	private async getAnimeIdsBetween(
		startId: number,
		endId: number,
	): Promise<number[]> {
		try {
			return await AnimeRepository.findIdsBetween(startId, endId);
		} catch (error) {
			throw new FetcherError(
				FetcherErrorType.DATABASE_ERROR,
				`Failed to get anime IDs between ${startId} and ${endId}`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	}
}
