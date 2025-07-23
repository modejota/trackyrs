import PeopleRepository from "@trackyrs/database/repositories/myanimelist/people-repository";
import type { NewPeople } from "@trackyrs/database/schemas/myanimelist/people-schema";
import { BaseFetcher } from "@/base-fetcher";
import { FetcherError, FetcherErrorType } from "@/fetcher-error";
import { PeopleMapper } from "@/mappers/people-mapper";
import type {
	DatabaseOperationResult,
	JikanResponse,
	PersonData,
} from "@/types";

export class PeopleFetcher extends BaseFetcher {
	async insertAll(): Promise<DatabaseOperationResult> {
		return this.insertRange(1);
	}

	async updateAll(): Promise<DatabaseOperationResult> {
		return this.updateRange(1);
	}

	async insertSingle(id: number): Promise<DatabaseOperationResult> {
		try {
			return await this.processPersonId(id, false);
		} catch (error) {
			if (error instanceof FetcherError) {
				throw error;
			}
			throw new FetcherError(
				FetcherErrorType.UNKNOWN_ERROR,
				`Failed to insert single person ${id}`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	}

	async insertRange(startId = 1): Promise<DatabaseOperationResult> {
		const startPage =
			Math.floor((startId - 1) / BaseFetcher.ITEMS_PER_PAGE) + 1;
		try {
			return await this.fetchPaginatedData<PersonData>(
				`${this.baseUrl}/people`,
				(data: JikanResponse<PersonData[]>) =>
					this.processPersonPageRange(data, startId, false),
				startPage,
				false,
			);
		} catch (error) {
			if (error instanceof FetcherError) {
				throw error;
			}
			throw new FetcherError(
				FetcherErrorType.UNKNOWN_ERROR,
				`Failed to insert people range starting from ${startId}`,
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
				const result = await this.fetchPaginatedData<PersonData>(
					`${this.baseUrl}/people`,
					(data: JikanResponse<PersonData[]>) =>
						this.processPersonPageBetween(data, startId, endId, false),
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
				`Failed to insert people between ${startId} and ${endId}`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	}

	async updateSingle(id: number): Promise<DatabaseOperationResult> {
		try {
			return await this.processPersonId(id, true);
		} catch (error) {
			this.progressBar.stop();
			if (error instanceof FetcherError) {
				throw error;
			}
			throw new FetcherError(
				FetcherErrorType.UNKNOWN_ERROR,
				`Failed to update single person ${id}`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	}

	async updateRange(startId = 1): Promise<DatabaseOperationResult> {
		const startPage =
			Math.floor((startId - 1) / BaseFetcher.ITEMS_PER_PAGE) + 1;
		try {
			return await this.fetchPaginatedData<PersonData>(
				`${this.baseUrl}/people`,
				(data) => this.processPersonPageRange(data, startId, true),
				startPage,
				false,
			);
		} catch (error) {
			if (error instanceof FetcherError) {
				throw error;
			}
			throw new FetcherError(
				FetcherErrorType.UNKNOWN_ERROR,
				`Failed to update people range starting from ${startId}`,
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
				const result = await this.fetchPaginatedData<PersonData>(
					`${this.baseUrl}/people`,
					(data) => this.processPersonPageBetween(data, startId, endId, true),
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
				`Failed to update people between ${startId} and ${endId}`,
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

	private async processPersonId(
		id: number,
		isUpdate: boolean,
	): Promise<DatabaseOperationResult> {
		try {
			const data = await this.fetchJson<JikanResponse<PersonData>>(
				`${this.baseUrl}/people/${id}`,
			);

			if (!data || !data.data) {
				return { inserted: 0, updated: 0, skipped: 1, errors: 0 };
			}

			return await this.insertOrUpdatePerson(data.data, isUpdate);
		} catch (error) {
			if (error instanceof FetcherError) {
				throw error;
			}
			return { inserted: 0, updated: 0, skipped: 0, errors: 1 };
		}
	}
	private async insertOrUpdatePerson(
		personData: PersonData,
		forceUpdate: boolean,
	): Promise<DatabaseOperationResult> {
		try {
			const mappedData: NewPeople = PeopleMapper.mapPeopleData(personData);

			const existingPerson = await PeopleRepository.findById(personData.mal_id);

			if (existingPerson) {
				if (forceUpdate) {
					await PeopleRepository.update(personData.mal_id, mappedData);
					return { inserted: 0, updated: 1, skipped: 0, errors: 0 };
				}
				return { inserted: 0, updated: 0, skipped: 1, errors: 0 };
			}

			await PeopleRepository.insert(mappedData);
			return { inserted: 1, updated: 0, skipped: 0, errors: 0 };
		} catch (error) {
			throw new FetcherError(
				FetcherErrorType.DATABASE_ERROR,
				`Failed to insert/update person ${personData.mal_id}`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	}

	private async processPersonPageRange(
		data: JikanResponse<PersonData[]>,
		startId: number,
		isUpdate = false,
	): Promise<DatabaseOperationResult> {
		return this.processPersonPageFiltered(
			data,
			(mal_id) => mal_id >= startId,
			isUpdate,
		);
	}

	private async processPersonPageBetween(
		data: JikanResponse<PersonData[]>,
		startId: number,
		endId: number,
		isUpdate = false,
	): Promise<DatabaseOperationResult> {
		return this.processPersonPageFiltered(
			data,
			(mal_id) => mal_id >= startId && mal_id <= endId,
			isUpdate,
		);
	}

	private async processPersonPageFiltered(
		data: JikanResponse<PersonData[]>,
		filter: (mal_id: number) => boolean,
		isUpdate = false,
	): Promise<DatabaseOperationResult> {
		const result: DatabaseOperationResult = {
			inserted: 0,
			updated: 0,
			skipped: 0,
			errors: 0,
		};

		for (const personData of data.data) {
			if (filter(personData.mal_id)) {
				try {
					const itemResult = await this.insertOrUpdatePerson(
						personData,
						isUpdate,
					);
					result.inserted += itemResult.inserted;
					result.updated += itemResult.updated;
					result.skipped += itemResult.skipped;
					result.errors += itemResult.errors;
				} catch (error) {
					result.errors++;
					console.warn(`Error processing person ${personData.mal_id}:`, error);
				}
			}
		}
		return result;
	}
}
