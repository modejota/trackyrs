import MangaGenreRepository from "@trackyrs/database/repositories/myanimelist/manga/manga-genre-repository";
import MangaRepository from "@trackyrs/database/repositories/myanimelist/manga/manga-repository";
import MangaToGenreRepository from "@trackyrs/database/repositories/myanimelist/manga/manga-to-genre-repository";
import MangaToMagazineRepository from "@trackyrs/database/repositories/myanimelist/manga/manga-to-magazine-repository";
import MangaToPeopleRepository from "@trackyrs/database/repositories/myanimelist/manga/manga-to-people-repository";
import type { NewManga } from "@trackyrs/database/schemas/myanimelist/manga/manga-schema";
import { BaseFetcher } from "@/base-fetcher";
import { FetcherError, FetcherErrorType } from "@/fetcher-error";
import { MangaMapper } from "@/mappers/manga-mapper";
import type {
	DatabaseOperationResult,
	JikanResponse,
	MangaData,
} from "@/types";

export class MangaFetcher extends BaseFetcher {
	async insertAll(): Promise<DatabaseOperationResult> {
		return this.insertRange(1);
	}

	async updateAll(): Promise<DatabaseOperationResult> {
		return this.updateRange(1);
	}

	async insertSingle(id: number): Promise<DatabaseOperationResult> {
		try {
			return await this.processMangaId(id, false);
		} catch (error) {
			if (error instanceof FetcherError) {
				throw error;
			}
			throw new FetcherError(
				FetcherErrorType.UNKNOWN_ERROR,
				`Failed to insert single manga ${id}`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	}

	async insertRange(startId = 1): Promise<DatabaseOperationResult> {
		const startPage =
			Math.floor((startId - 1) / BaseFetcher.ITEMS_PER_PAGE) + 1;
		try {
			return await this.fetchPaginatedData<MangaData>(
				`${this.baseUrl}/manga`,
				(data) => this.processMangaPageRange(data, startId),
				startPage,
				false,
			);
		} catch (error) {
			if (error instanceof FetcherError) {
				throw error;
			}
			throw new FetcherError(
				FetcherErrorType.UNKNOWN_ERROR,
				`Failed to insert manga range starting from ${startId}`,
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
				const result = await this.fetchPaginatedData<MangaData>(
					`${this.baseUrl}/manga`,
					(data) => this.processMangaPageBetween(data, startId, endId),
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
				`Failed to insert manga between ${startId} and ${endId}`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	}

	async updateSingle(id: number): Promise<DatabaseOperationResult> {
		try {
			return await this.processMangaId(id, true);
		} catch (error) {
			if (error instanceof FetcherError) {
				throw error;
			}
			throw new FetcherError(
				FetcherErrorType.UNKNOWN_ERROR,
				`Failed to update single manga ${id}`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	}

	async updateRange(startId = 1): Promise<DatabaseOperationResult> {
		const startPage =
			Math.floor((startId - 1) / BaseFetcher.ITEMS_PER_PAGE) + 1;
		try {
			return await this.fetchPaginatedData<MangaData>(
				`${this.baseUrl}/manga`,
				(data) => this.processMangaPageRange(data, startId, true),
				startPage,
				false,
			);
		} catch (error) {
			if (error instanceof FetcherError) {
				throw error;
			}
			throw new FetcherError(
				FetcherErrorType.UNKNOWN_ERROR,
				`Failed to update manga range starting from ${startId}`,
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
				const result = await this.fetchPaginatedData<MangaData>(
					`${this.baseUrl}/manga`,
					(data) => this.processMangaPageBetween(data, startId, endId, true),
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
				`Failed to update manga between ${startId} and ${endId}`,
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

	private async processMangaId(
		id: number,
		isUpdate: boolean,
	): Promise<DatabaseOperationResult> {
		try {
			const data = await this.fetchJson<JikanResponse<MangaData>>(
				`${this.baseUrl}/manga/${id}`,
			);

			if (!data || !data.data) {
				return { inserted: 0, updated: 0, skipped: 1, errors: 0 };
			}

			return await this.insertOrUpdateManga(data.data, isUpdate);
		} catch (error) {
			if (error instanceof FetcherError) {
				throw error;
			}
			return { inserted: 0, updated: 0, skipped: 0, errors: 1 };
		}
	}

	private async insertOrUpdateManga(
		mangaData: MangaData,
		forceUpdate: boolean,
	): Promise<DatabaseOperationResult> {
		try {
			const genreIds = await MangaGenreRepository.findAllIds();
			const genreMap = new Map(genreIds.map((id) => [id, id]));

			const mappedData: NewManga = MangaMapper.mapMangaData(mangaData);
			const existingManga = await MangaRepository.findById(mangaData.mal_id);

			let result: DatabaseOperationResult;

			if (existingManga) {
				if (forceUpdate) {
					await MangaRepository.update(mangaData.mal_id, mappedData);
					result = { inserted: 0, updated: 1, skipped: 0, errors: 0 };
				} else {
					result = { inserted: 0, updated: 0, skipped: 1, errors: 0 };
				}
			} else {
				await MangaRepository.insert(mappedData);
				result = { inserted: 1, updated: 0, skipped: 0, errors: 0 };
			}

			if (result.inserted > 0 || result.updated > 0) {
				const genreRelations = MangaMapper.mapGenreRelations(
					mangaData.mal_id,
					mangaData,
					genreMap,
				);

				if (genreRelations.length > 0) {
					await MangaToGenreRepository.insertMany(genreRelations);
				}

				const magazineRelations = MangaMapper.mapMagazineRelations(
					mangaData.mal_id,
					mangaData,
				);

				if (magazineRelations.length > 0) {
					await MangaToMagazineRepository.insertMany(magazineRelations);
				}

				const peopleRelations = MangaMapper.mapPeopleRelations(
					mangaData.mal_id,
					mangaData,
				);

				if (peopleRelations.length > 0) {
					await MangaToPeopleRepository.insertMany(peopleRelations);
				}
			}

			return result;
		} catch (error) {
			throw new FetcherError(
				FetcherErrorType.DATABASE_ERROR,
				`Failed to insert/update manga ${mangaData.mal_id}`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	}

	private async processMangaPageFiltered(
		data: JikanResponse<MangaData[]>,
		filter: (mal_id: number) => boolean,
		isUpdate = false,
	): Promise<DatabaseOperationResult> {
		const result: DatabaseOperationResult = {
			inserted: 0,
			updated: 0,
			skipped: 0,
			errors: 0,
		};
		for (const mangaData of data.data) {
			if (filter(mangaData.mal_id)) {
				try {
					const itemResult = await this.insertOrUpdateManga(
						mangaData,
						isUpdate,
					);
					result.inserted += itemResult.inserted;
					result.updated += itemResult.updated;
					result.skipped += itemResult.skipped;
					result.errors += itemResult.errors;
				} catch (error) {
					result.errors++;
					console.warn(`Error processing manga ${mangaData.mal_id}:`, error);
				}
			}
		}
		return result;
	}

	private async processMangaPageRange(
		data: JikanResponse<MangaData[]>,
		startId: number,
		isUpdate = false,
	): Promise<DatabaseOperationResult> {
		return this.processMangaPageFiltered(
			data,
			(mal_id) => mal_id >= startId,
			isUpdate,
		);
	}

	private async processMangaPageBetween(
		data: JikanResponse<MangaData[]>,
		startId: number,
		endId: number,
		isUpdate = false,
	): Promise<DatabaseOperationResult> {
		return this.processMangaPageFiltered(
			data,
			(mal_id) => mal_id >= startId && mal_id <= endId,
			isUpdate,
		);
	}
}
