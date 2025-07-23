import CharacterRepository from "@trackyrs/database/repositories/myanimelist/character/character-repository";
import type { NewCharacter } from "@trackyrs/database/schemas/myanimelist/character/character-schema";
import { BaseFetcher } from "@/base-fetcher";
import { FetcherError, FetcherErrorType } from "@/fetcher-error";
import { CharacterMapper } from "@/mappers/character-mapper";
import type {
	CharacterData,
	DatabaseOperationResult,
	JikanResponse,
} from "@/types";

export class CharactersFetcher extends BaseFetcher {
	async insertAll(): Promise<DatabaseOperationResult> {
		return this.insertRange(1);
	}

	async updateAll(): Promise<DatabaseOperationResult> {
		return this.updateRange(1);
	}

	async insertSingle(id: number): Promise<DatabaseOperationResult> {
		try {
			return await this.processCharacterId(id, false);
		} catch (error) {
			this.progressBar.stop();
			if (error instanceof FetcherError) {
				throw error;
			}
			throw new FetcherError(
				FetcherErrorType.UNKNOWN_ERROR,
				`Failed to insert single character ${id}`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	}

	async insertRange(startId = 1): Promise<DatabaseOperationResult> {
		const startPage =
			Math.floor((startId - 1) / BaseFetcher.ITEMS_PER_PAGE) + 1;
		try {
			return await this.fetchPaginatedData<CharacterData>(
				`${this.baseUrl}/characters`,
				(data) => this.processCharacterPageRange(data, startId, false),
				startPage,
				false,
			);
		} catch (error) {
			if (error instanceof FetcherError) {
				throw error;
			}
			throw new FetcherError(
				FetcherErrorType.UNKNOWN_ERROR,
				`Failed to insert characters range starting from ${startId}`,
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
				const result = await this.fetchPaginatedData<CharacterData>(
					`${this.baseUrl}/characters`,
					(data) =>
						this.processCharacterPageBetween(data, startId, endId, false),
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
				`Failed to insert characters between ${startId} and ${endId}`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	}

	async updateSingle(id: number): Promise<DatabaseOperationResult> {
		try {
			return await this.processCharacterId(id, true);
		} catch (error) {
			this.progressBar.stop();
			if (error instanceof FetcherError) {
				throw error;
			}
			throw new FetcherError(
				FetcherErrorType.UNKNOWN_ERROR,
				`Failed to update single character ${id}`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	}

	async updateRange(startId = 1): Promise<DatabaseOperationResult> {
		const startPage =
			Math.floor((startId - 1) / BaseFetcher.ITEMS_PER_PAGE) + 1;
		try {
			return await this.fetchPaginatedData<CharacterData>(
				`${this.baseUrl}/characters`,
				(data) => this.processCharacterPageRange(data, startId, true),
				startPage,
				false,
			);
		} catch (error) {
			if (error instanceof FetcherError) {
				throw error;
			}
			throw new FetcherError(
				FetcherErrorType.UNKNOWN_ERROR,
				`Failed to update characters range starting from ${startId}`,
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
				const result = await this.fetchPaginatedData<CharacterData>(
					`${this.baseUrl}/characters`,
					(data) =>
						this.processCharacterPageBetween(data, startId, endId, true),
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
				`Failed to update characters between ${startId} and ${endId}`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	}

	private async processCharacterId(
		id: number,
		isUpdate: boolean,
	): Promise<DatabaseOperationResult> {
		try {
			const data = await this.fetchJson<JikanResponse<CharacterData>>(
				`${this.baseUrl}/characters/${id}`,
			);

			if (!data || !data.data) {
				return { inserted: 0, updated: 0, skipped: 1, errors: 0 };
			}

			return await this.insertOrUpdateCharacter(data.data, isUpdate);
		} catch (error) {
			if (error instanceof FetcherError) {
				throw error;
			}
			return { inserted: 0, updated: 0, skipped: 0, errors: 1 };
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

	private async processCharacterPageRange(
		data: JikanResponse<CharacterData[]>,
		startId: number,
		isUpdate = false,
	): Promise<DatabaseOperationResult> {
		return this.processCharacterPageFiltered(
			data,
			(mal_id) => mal_id >= startId,
			isUpdate,
		);
	}

	private async processCharacterPageBetween(
		data: JikanResponse<CharacterData[]>,
		startId: number,
		endId: number,
		isUpdate = false,
	): Promise<DatabaseOperationResult> {
		return this.processCharacterPageFiltered(
			data,
			(mal_id) => mal_id >= startId && mal_id <= endId,
			isUpdate,
		);
	}

	private async processCharacterPageFiltered(
		data: JikanResponse<CharacterData[]>,
		filter: (mal_id: number) => boolean,
		isUpdate = false,
	): Promise<DatabaseOperationResult> {
		const result: DatabaseOperationResult = {
			inserted: 0,
			updated: 0,
			skipped: 0,
			errors: 0,
		};
		for (const characterData of data.data) {
			if (filter(characterData.mal_id)) {
				try {
					const itemResult = await this.insertOrUpdateCharacter(
						characterData,
						isUpdate,
					);
					result.inserted += itemResult.inserted;
					result.updated += itemResult.updated;
					result.skipped += itemResult.skipped;
					result.errors += itemResult.errors;
				} catch (error) {
					result.errors++;
					console.warn(
						`Error processing character ${characterData.mal_id}:`,
						error,
					);
				}
			}
		}
		return result;
	}

	private async insertOrUpdateCharacter(
		characterData: CharacterData,
		forceUpdate: boolean,
	): Promise<DatabaseOperationResult> {
		try {
			const mappedData: NewCharacter =
				CharacterMapper.mapCharacterData(characterData);

			const existingCharacter = await CharacterRepository.findById(
				characterData.mal_id,
			);

			if (existingCharacter) {
				if (forceUpdate) {
					await CharacterRepository.update(characterData.mal_id, mappedData);
					return { inserted: 0, updated: 1, skipped: 0, errors: 0 };
				}
				return { inserted: 0, updated: 0, skipped: 1, errors: 0 };
			}

			await CharacterRepository.insert(mappedData);
			return { inserted: 1, updated: 0, skipped: 0, errors: 0 };
		} catch (error) {
			throw new FetcherError(
				FetcherErrorType.DATABASE_ERROR,
				`Failed to insert/update character ${characterData.mal_id}`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	}
}
