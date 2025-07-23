import AnimeRepository from "@trackyrs/database/repositories/myanimelist/anime/anime-repository";
import type { NewAnime } from "@trackyrs/database/schemas/myanimelist/anime/anime-schema";
import { BaseFetcher } from "@/base-fetcher";
import { FetcherError, FetcherErrorType } from "@/fetcher-error";
import { AnimeMapper } from "@/mappers/anime-mapper";
import type {
	AnimeData,
	DatabaseOperationResult,
	JikanResponse,
} from "@/types";

export class AnimeFetcher extends BaseFetcher {
	async insertAll(): Promise<DatabaseOperationResult> {
		return this.insertRange(1);
	}

	async updateAll(): Promise<DatabaseOperationResult> {
		return this.updateRange(1);
	}

	async insertSingle(id: number): Promise<DatabaseOperationResult> {
		try {
			return await this.processAnimeId(id, false);
		} catch (error) {
			this.progressBar.stop();
			if (error instanceof FetcherError) {
				throw error;
			}
			throw new FetcherError(
				FetcherErrorType.UNKNOWN_ERROR,
				`Failed to insert single anime ${id}`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	}

	async insertRange(startId = 1): Promise<DatabaseOperationResult> {
		const startPage =
			Math.floor((startId - 1) / BaseFetcher.ITEMS_PER_PAGE) + 1;
		try {
			return await this.fetchPaginatedData<AnimeData>(
				`${this.baseUrl}/anime`,
				(data) => this.processAnimePageRange(data, startId),
				startPage,
				false,
			);
		} catch (error) {
			if (error instanceof FetcherError) {
				throw error;
			}
			throw new FetcherError(
				FetcherErrorType.UNKNOWN_ERROR,
				`Failed to insert anime range starting from ${startId}`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
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
		const startPage =
			Math.floor((startId - 1) / BaseFetcher.ITEMS_PER_PAGE) + 1;
		const endPage = Math.floor((endId - 1) / BaseFetcher.ITEMS_PER_PAGE) + 1;
		try {
			let currentPage = startPage;
			const totalResult = { inserted: 0, updated: 0, skipped: 0, errors: 0 };
			while (currentPage <= endPage) {
				const result = await this.fetchPaginatedData<AnimeData>(
					`${this.baseUrl}/anime`,
					(data) => this.processAnimePageBetween(data, startId, endId),
					currentPage,
					true,
				);
				totalResult.inserted += result.inserted;
				totalResult.updated += result.updated;
				totalResult.skipped += result.skipped;
				totalResult.errors += result.errors;
				currentPage++;
			}
			return totalResult;
		} catch (error) {
			if (error instanceof FetcherError) {
				throw error;
			}
			throw new FetcherError(
				FetcherErrorType.UNKNOWN_ERROR,
				`Failed to insert anime between ${startId} and ${endId}`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	}

	async insertBySeason(
		year: number,
		season: string,
	): Promise<DatabaseOperationResult> {
		const validSeasons = ["winter", "spring", "summer", "fall"];
		if (!validSeasons.includes(season.toLowerCase())) {
			throw new FetcherError(
				FetcherErrorType.VALIDATION_ERROR,
				`Invalid season: ${season}. Must be one of: ${validSeasons.join(", ")}`,
			);
		}
		try {
			return await this.fetchPaginatedData<AnimeData>(
				`${this.baseUrl}/seasons/${year}/${season.toLowerCase()}`,
				(data) => this.processSeasonPage(data),
				1,
				false,
			);
		} catch (error) {
			if (error instanceof FetcherError) {
				throw error;
			}
			throw new FetcherError(
				FetcherErrorType.UNKNOWN_ERROR,
				`Failed to insert anime for ${season} ${year}`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	}

	async updateSingle(id: number): Promise<DatabaseOperationResult> {
		try {
			return await this.processAnimeId(id, true);
		} catch (error) {
			this.progressBar.stop();
			if (error instanceof FetcherError) {
				throw error;
			}
			throw new FetcherError(
				FetcherErrorType.UNKNOWN_ERROR,
				`Failed to update single anime ${id}`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	}

	async updateRange(startId = 1): Promise<DatabaseOperationResult> {
		const startPage =
			Math.floor((startId - 1) / BaseFetcher.ITEMS_PER_PAGE) + 1;
		try {
			return await this.fetchPaginatedData<AnimeData>(
				`${this.baseUrl}/anime`,
				(data) => this.processAnimePageRange(data, startId, true),
				startPage,
				false,
			);
		} catch (error) {
			if (error instanceof FetcherError) {
				throw error;
			}
			throw new FetcherError(
				FetcherErrorType.UNKNOWN_ERROR,
				`Failed to update anime range starting from ${startId}`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
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
		const startPage =
			Math.floor((startId - 1) / BaseFetcher.ITEMS_PER_PAGE) + 1;
		const endPage = Math.floor((endId - 1) / BaseFetcher.ITEMS_PER_PAGE) + 1;
		try {
			let currentPage = startPage;
			const totalResult = { inserted: 0, updated: 0, skipped: 0, errors: 0 };
			while (currentPage <= endPage) {
				const result = await this.fetchPaginatedData<AnimeData>(
					`${this.baseUrl}/anime`,
					(data) => this.processAnimePageBetween(data, startId, endId, true),
					currentPage,
					true,
				);
				totalResult.inserted += result.inserted;
				totalResult.updated += result.updated;
				totalResult.skipped += result.skipped;
				totalResult.errors += result.errors;
				currentPage++;
			}
			return totalResult;
		} catch (error) {
			if (error instanceof FetcherError) {
				throw error;
			}
			throw new FetcherError(
				FetcherErrorType.UNKNOWN_ERROR,
				`Failed to update anime between ${startId} and ${endId}`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	}

	async insertFromList(ids: number[]): Promise<DatabaseOperationResult> {
		this.resetProgress();
		this.operationProgress.total = ids.length;
		this.progressBar.start(ids.length, 0);
		const totalResult: DatabaseOperationResult = {
			inserted: 0,
			updated: 0,
			skipped: 0,
			errors: 0,
		};
		try {
			for (const id of ids) {
				const result = await this.insertSingle(id);
				totalResult.inserted += result.inserted;
				totalResult.updated += result.updated;
				totalResult.skipped += result.skipped;
				totalResult.errors += result.errors;
				this.operationProgress.processed++;
				this.operationProgress.inserted = totalResult.inserted;
				this.operationProgress.updated = totalResult.updated;
				this.operationProgress.skipped = totalResult.skipped;
				this.operationProgress.errors = totalResult.errors;
				this.progressBar.update(this.operationProgress.processed);
			}
			return totalResult;
		} finally {
			this.progressBar.stop();
		}
	}

	async updateFromList(ids: number[]): Promise<DatabaseOperationResult> {
		this.resetProgress();
		this.operationProgress.total = ids.length;
		this.progressBar.start(ids.length, 0);
		const totalResult: DatabaseOperationResult = {
			inserted: 0,
			updated: 0,
			skipped: 0,
			errors: 0,
		};
		try {
			for (const id of ids) {
				const result = await this.updateSingle(id);
				totalResult.inserted += result.inserted;
				totalResult.updated += result.updated;
				totalResult.skipped += result.skipped;
				totalResult.errors += result.errors;
				this.operationProgress.processed++;
				this.operationProgress.inserted = totalResult.inserted;
				this.operationProgress.updated = totalResult.updated;
				this.operationProgress.skipped = totalResult.skipped;
				this.operationProgress.errors = totalResult.errors;
				this.progressBar.update(this.operationProgress.processed);
			}
			return totalResult;
		} finally {
			this.progressBar.stop();
		}
	}

	private async processAnimeId(
		id: number,
		isUpdate: boolean,
	): Promise<DatabaseOperationResult> {
		try {
			const data = await this.fetchJson<JikanResponse<AnimeData>>(
				`${this.baseUrl}/anime/${id}`,
			);

			if (!data || !data.data) {
				return { inserted: 0, updated: 0, skipped: 1, errors: 0 };
			}

			return await this.insertOrUpdateAnime(data.data, isUpdate);
		} catch (error) {
			if (error instanceof FetcherError) {
				throw error;
			}
			return { inserted: 0, updated: 0, skipped: 0, errors: 1 };
		}
	}

	private async processSeasonPage(
		data: JikanResponse<AnimeData[]>,
	): Promise<DatabaseOperationResult> {
		const result: DatabaseOperationResult = {
			inserted: 0,
			updated: 0,
			skipped: 0,
			errors: 0,
		};

		for (const animeData of data.data) {
			try {
				const itemResult = await this.insertOrUpdateAnime(animeData, false);
				result.inserted += itemResult.inserted;
				result.updated += itemResult.updated;
				result.skipped += itemResult.skipped;
				result.errors += itemResult.errors;
			} catch (error) {
				result.errors++;
				console.warn(`Error processing anime ${animeData.mal_id}:`, error);
			}
		}

		return result;
	}

	private async insertOrUpdateAnime(
		animeData: AnimeData,
		forceUpdate: boolean,
	): Promise<DatabaseOperationResult> {
		try {
			const mappedData: NewAnime = AnimeMapper.mapAnimeData(animeData);

			const existingAnime = await AnimeRepository.findById(animeData.mal_id);

			if (existingAnime) {
				if (forceUpdate) {
					await AnimeRepository.update(animeData.mal_id, mappedData);
					return { inserted: 0, updated: 1, skipped: 0, errors: 0 };
				}
				return { inserted: 0, updated: 0, skipped: 1, errors: 0 };
			}

			await AnimeRepository.insert(mappedData);
			return { inserted: 1, updated: 0, skipped: 0, errors: 0 };
		} catch (error) {
			throw new FetcherError(
				FetcherErrorType.DATABASE_ERROR,
				`Failed to insert/update anime ${animeData.mal_id}`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	}

	private async processAnimePageFiltered(
		data: JikanResponse<AnimeData[]>,
		filter: (mal_id: number) => boolean,
		isUpdate = false,
	): Promise<DatabaseOperationResult> {
		const result: DatabaseOperationResult = {
			inserted: 0,
			updated: 0,
			skipped: 0,
			errors: 0,
		};
		for (const animeData of data.data) {
			if (filter(animeData.mal_id)) {
				try {
					const itemResult = await this.insertOrUpdateAnime(
						animeData,
						isUpdate,
					);
					result.inserted += itemResult.inserted;
					result.updated += itemResult.updated;
					result.skipped += itemResult.skipped;
					result.errors += itemResult.errors;
				} catch (error) {
					result.errors++;
					console.warn(`Error processing anime ${animeData.mal_id}:`, error);
				}
			}
		}
		return result;
	}

	private async processAnimePageRange(
		data: JikanResponse<AnimeData[]>,
		startId: number,
		isUpdate = false,
	): Promise<DatabaseOperationResult> {
		return this.processAnimePageFiltered(
			data,
			(mal_id) => mal_id >= startId,
			isUpdate,
		);
	}

	private async processAnimePageBetween(
		data: JikanResponse<AnimeData[]>,
		startId: number,
		endId: number,
		isUpdate = false,
	): Promise<DatabaseOperationResult> {
		return this.processAnimePageFiltered(
			data,
			(mal_id) => mal_id >= startId && mal_id <= endId,
			isUpdate,
		);
	}
}
