import MangaMagazineRepository from "@trackyrs/database/repositories/myanimelist/manga/manga-magazine-repository";
import type { NewMagazine } from "@trackyrs/database/schemas/myanimelist/manga/manga-magazine-schema";
import { BaseFetcher } from "@/base-fetcher";
import { FetcherError, FetcherErrorType } from "@/fetcher-error";
import { MagazineMapper } from "@/mappers/magazine-mapper";
import type {
	DatabaseOperationResult,
	JikanResponse,
	MagazineData,
} from "@/types";

export class MagazinesFetcher extends BaseFetcher {
	async insertAll(): Promise<DatabaseOperationResult> {
		return this.insertRange(1);
	}

	async updateAll(): Promise<DatabaseOperationResult> {
		return this.updateRange(1);
	}

	async insertSingle(id: number): Promise<DatabaseOperationResult> {
		try {
			return await this.processMagazineId(id, false);
		} catch (error) {
			if (error instanceof FetcherError) {
				throw error;
			}
			throw new FetcherError(
				FetcherErrorType.UNKNOWN_ERROR,
				`Failed to insert single magazine ${id}`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	}

	async insertRange(startId = 1): Promise<DatabaseOperationResult> {
		const startPage =
			Math.floor((startId - 1) / BaseFetcher.ITEMS_PER_PAGE) + 1;
		try {
			return await this.fetchPaginatedData<MagazineData>(
				`${this.baseUrl}/magazines`,
				(data) => this.processMagazinePageRange(data, startId),
				startPage,
				false,
			);
		} catch (error) {
			if (error instanceof FetcherError) {
				throw error;
			}
			throw new FetcherError(
				FetcherErrorType.UNKNOWN_ERROR,
				`Failed to insert magazine range starting from ${startId}`,
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
				const result = await this.fetchPaginatedData<MagazineData>(
					`${this.baseUrl}/magazines`,
					(data) => this.processMagazinePageBetween(data, startId, endId),
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
				`Failed to insert magazines between ${startId} and ${endId}`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	}

	async updateSingle(id: number): Promise<DatabaseOperationResult> {
		try {
			this.resetProgress();
			this.operationProgress.total = 1;
			this.progressBar.start(1, 0);

			const result = await this.processMagazineId(id, true);

			this.progressBar.stop();
			return result;
		} catch (error) {
			this.progressBar.stop();
			if (error instanceof FetcherError) {
				throw error;
			}
			throw new FetcherError(
				FetcherErrorType.UNKNOWN_ERROR,
				`Failed to update single magazine ${id}`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	}

	async updateRange(startId = 1): Promise<DatabaseOperationResult> {
		const startPage =
			Math.floor((startId - 1) / BaseFetcher.ITEMS_PER_PAGE) + 1;
		try {
			return await this.fetchPaginatedData<MagazineData>(
				`${this.baseUrl}/magazines`,
				(data) => this.processMagazinePageRange(data, startId, true),
				startPage,
				false,
			);
		} catch (error) {
			if (error instanceof FetcherError) {
				throw error;
			}
			throw new FetcherError(
				FetcherErrorType.UNKNOWN_ERROR,
				`Failed to update magazine range starting from ${startId}`,
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
				const result = await this.fetchPaginatedData<MagazineData>(
					`${this.baseUrl}/magazines`,
					(data) => this.processMagazinePageBetween(data, startId, endId, true),
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
				`Failed to update magazines between ${startId} and ${endId}`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	}

	private async processMagazineId(
		id: number,
		isUpdate: boolean,
	): Promise<DatabaseOperationResult> {
		try {
			const data = await this.fetchJson<JikanResponse<MagazineData>>(
				`${this.baseUrl}/magazines/${id}`,
			);

			if (!data || !data.data) {
				return { inserted: 0, updated: 0, skipped: 1, errors: 0 };
			}

			return await this.insertOrUpdateMagazine(data.data, isUpdate);
		} catch (error) {
			if (error instanceof FetcherError) {
				throw error;
			}
			return { inserted: 0, updated: 0, skipped: 0, errors: 1 };
		}
	}

	private async insertOrUpdateMagazine(
		magazineData: MagazineData,
		forceUpdate: boolean,
	): Promise<DatabaseOperationResult> {
		try {
			const mappedData: NewMagazine =
				MagazineMapper.mapMagazineData(magazineData);

			const existingMagazine = await MangaMagazineRepository.findById(
				magazineData.mal_id,
			);

			if (existingMagazine) {
				if (forceUpdate) {
					await MangaMagazineRepository.update(magazineData.mal_id, mappedData);
					return { inserted: 0, updated: 1, skipped: 0, errors: 0 };
				}
				return { inserted: 0, updated: 0, skipped: 1, errors: 0 };
			}

			await MangaMagazineRepository.insert(mappedData);
			return { inserted: 1, updated: 0, skipped: 0, errors: 0 };
		} catch (error) {
			throw new FetcherError(
				FetcherErrorType.DATABASE_ERROR,
				`Failed to insert/update magazine ${magazineData.mal_id}`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	}

	private async processMagazinePageFiltered(
		data: JikanResponse<MagazineData[]>,
		filter: (mal_id: number) => boolean,
		isUpdate = false,
	): Promise<DatabaseOperationResult> {
		const result: DatabaseOperationResult = {
			inserted: 0,
			updated: 0,
			skipped: 0,
			errors: 0,
		};
		for (const magazineData of data.data) {
			if (filter(magazineData.mal_id)) {
				try {
					const itemResult = await this.insertOrUpdateMagazine(
						magazineData,
						isUpdate,
					);
					result.inserted += itemResult.inserted;
					result.updated += itemResult.updated;
					result.skipped += itemResult.skipped;
					result.errors += itemResult.errors;
				} catch (error) {
					result.errors++;
					console.warn(
						`Error processing magazine ${magazineData.mal_id}:`,
						error,
					);
				}
			}
		}
		return result;
	}

	private async processMagazinePageRange(
		data: JikanResponse<MagazineData[]>,
		startId: number,
		isUpdate = false,
	): Promise<DatabaseOperationResult> {
		return this.processMagazinePageFiltered(
			data,
			(mal_id) => mal_id >= startId,
			isUpdate,
		);
	}

	private async processMagazinePageBetween(
		data: JikanResponse<MagazineData[]>,
		startId: number,
		endId: number,
		isUpdate = false,
	): Promise<DatabaseOperationResult> {
		return this.processMagazinePageFiltered(
			data,
			(mal_id) => mal_id >= startId && mal_id <= endId,
			isUpdate,
		);
	}
}
