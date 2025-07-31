import PeopleRepository from "@trackyrs/database/repositories/myanimelist/people-repository";
import type { NewPeople } from "@trackyrs/database/schemas/myanimelist/people-schema";
import { BaseFetcher } from "@/base-fetcher";
import { PeopleMapper } from "@/mappers/people-mapper";
import type {
	DatabaseOperationResult,
	JikanResponse,
	PersonData,
} from "@/types";

export class PeopleFetcher extends BaseFetcher {
	async upsertAll(): Promise<DatabaseOperationResult> {
		return this.upsertRange(1);
	}

	async upsertSingle(id: number): Promise<DatabaseOperationResult> {
		try {
			return await this.processPersonId(id);
		} catch (error) {
			this.stopProgress();
			console.error(`❌ Failed to upsert single person ${id}`, {
				entityType: "person",
				entityId: id,
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
			});
			return { inserted: 0, updated: 0, skipped: 0, errors: 1, ids: [] };
		}
	}

	async upsertRange(startId = 1): Promise<DatabaseOperationResult> {
		const startPage =
			Math.floor((startId - 1) / BaseFetcher.ITEMS_PER_PAGE) + 1;
		try {
			return await this.fetchPaginatedData<PersonData>(
				`${this.baseUrl}/people`,
				(data: JikanResponse<PersonData[]>) =>
					this.processPersonPageRange(data, startId),
				startPage,
				false,
			);
		} catch (error) {
			console.error(
				`❌ Failed to upsert people range starting from ${startId}`,
				{
					entityType: "person",
					startId,
					error: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
				},
			);
			return { inserted: 0, updated: 0, skipped: 0, errors: 1, ids: [] };
		}
	}

	async upsertFromList(ids: number[]): Promise<DatabaseOperationResult> {
		this.resetProgress();
		this.startProgress(ids.length);
		const totalResult: DatabaseOperationResult = {
			inserted: 0,
			updated: 0,
			skipped: 0,
			errors: 0,
			ids: [],
		};
		try {
			for (const id of ids) {
				try {
					const result = await this.upsertSingle(id);
					totalResult.inserted += result.inserted;
					totalResult.updated += result.updated;
					totalResult.skipped += result.skipped;
					totalResult.errors += result.errors;
					totalResult.ids.push(...result.ids);
				} catch (error) {
					totalResult.errors++;
					console.error(`Error processing person ID ${id}:`, {
						id,
						error: error instanceof Error ? error.message : String(error),
						stack: error instanceof Error ? error.stack : undefined,
					});
				}
				this.operationProgress.processed++;
				this.operationProgress.inserted = totalResult.inserted;
				this.operationProgress.updated = totalResult.updated;
				this.operationProgress.skipped = totalResult.skipped;
				this.operationProgress.errors = totalResult.errors;
				this.updateProgress(this.operationProgress.processed);
			}
			return totalResult;
		} finally {
			this.stopProgress();
		}
	}

	private async processPersonId(id: number): Promise<DatabaseOperationResult> {
		try {
			const data = await this.fetchJson<JikanResponse<PersonData>>(
				`${this.baseUrl}/people/${id}`,
			);

			if (!data || !data.data) {
				return { inserted: 0, updated: 0, skipped: 1, errors: 0, ids: [] };
			}

			return await this.upsertPerson(data.data);
		} catch (error) {
			console.error(
				`❌ FETCH ERROR: Failed to fetch full data for people ${id}`,
				{
					entityType: "people",
					entityId: id,
					error: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
				},
			);
			return { inserted: 0, updated: 0, skipped: 0, errors: 1, ids: [] };
		}
	}
	private async upsertPerson(
		personData: PersonData,
	): Promise<DatabaseOperationResult> {
		try {
			const mappedData: NewPeople = PeopleMapper.mapPeopleData(personData);
			const existingPerson = await PeopleRepository.findById(personData.mal_id);

			const upsertedPerson = await PeopleRepository.upsert(mappedData);

			if (existingPerson) {
				return {
					inserted: 0,
					updated: 1,
					skipped: 0,
					errors: 0,
					ids: [upsertedPerson.id],
				};
			}
			return {
				inserted: 1,
				updated: 0,
				skipped: 0,
				errors: 0,
				ids: [upsertedPerson.id],
			};
		} catch (error) {
			console.error(
				`❌ DATABASE_ERROR: Failed to upsert person ${personData.mal_id}`,
				{
					entityType: "person",
					entityId: personData.mal_id,
					error: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
				},
			);
			return { inserted: 0, updated: 0, skipped: 0, errors: 1, ids: [] };
		}
	}

	private async processPersonPageRange(
		data: JikanResponse<PersonData[]>,
		startId: number,
	): Promise<DatabaseOperationResult> {
		return this.processPersonPageFiltered(data, (mal_id) => mal_id >= startId);
	}

	private async processPersonPageFiltered(
		data: JikanResponse<PersonData[]>,
		filter: (mal_id: number) => boolean,
	): Promise<DatabaseOperationResult> {
		const result: DatabaseOperationResult = {
			inserted: 0,
			updated: 0,
			skipped: 0,
			errors: 0,
			ids: [],
		};

		for (const personData of data.data) {
			if (filter(personData.mal_id)) {
				try {
					const itemResult = await this.upsertPerson(personData);
					result.inserted += itemResult.inserted;
					result.updated += itemResult.updated;
					result.skipped += itemResult.skipped;
					result.errors += itemResult.errors;
					result.ids.push(...itemResult.ids);
				} catch (error) {
					result.errors++;
					console.error(`Error processing person ${personData.mal_id}:`, {
						id: personData.mal_id,
						error: error instanceof Error ? error.message : String(error),
						stack: error instanceof Error ? error.stack : undefined,
					});
				}
			}
		}
		return result;
	}
}
