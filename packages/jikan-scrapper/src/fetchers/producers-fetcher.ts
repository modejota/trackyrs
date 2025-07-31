import AnimeProducerRepository from "@trackyrs/database/repositories/myanimelist/anime/anime-producer-repository";
import type { NewProducer } from "@trackyrs/database/schemas/myanimelist/anime/anime-producer-schema";
import { BaseFetcher } from "@/base-fetcher";
import { ProducerMapper } from "@/mappers/producer-mapper";
import type {
	DatabaseOperationResult,
	JikanResponse,
	ProducerData,
} from "@/types";

export class ProducersFetcher extends BaseFetcher {
	async upsertAll(): Promise<DatabaseOperationResult> {
		return this.upsertRange(1);
	}

	async upsertSingle(id: number): Promise<DatabaseOperationResult> {
		try {
			return await this.processProducerId(id);
		} catch (error) {
			this.stopProgress();
			console.error(`❌ Failed to upsert single producer ${id}`, {
				entityType: "producer",
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
			return await this.fetchPaginatedData<ProducerData>(
				`${this.baseUrl}/producers`,
				(data) => this.processProducerPageRange(data, startId),
				startPage,
				false,
			);
		} catch (error) {
			console.error(
				`❌ Failed to upsert producer range starting from ${startId}`,
				{
					entityType: "producer",
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
					console.error(`Error processing producer ID ${id}:`, {
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

	private async processProducerId(
		id: number,
	): Promise<DatabaseOperationResult> {
		try {
			const data = await this.fetchJson<JikanResponse<ProducerData>>(
				`${this.baseUrl}/producers/${id}`,
			);

			if (!data || !data.data) {
				return { inserted: 0, updated: 0, skipped: 1, errors: 0, ids: [] };
			}

			return await this.upsertProducer(data.data);
		} catch (error) {
			console.error(`❌ FETCH ERROR: Failed to fetch data for producer ${id}`, {
				entityType: "producer",
				entityId: id,
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
			});
			return { inserted: 0, updated: 0, skipped: 0, errors: 1, ids: [] };
		}
	}

	private async upsertProducer(
		producerData: ProducerData,
	): Promise<DatabaseOperationResult> {
		try {
			const mappedData: NewProducer =
				ProducerMapper.mapProducerData(producerData);

			const existingProducer = await AnimeProducerRepository.findById(
				producerData.mal_id,
			);

			const upsertedProducer = await AnimeProducerRepository.upsert(mappedData);

			if (existingProducer) {
				return {
					inserted: 0,
					updated: 1,
					skipped: 0,
					errors: 0,
					ids: [upsertedProducer.id],
				};
			}
			return {
				inserted: 1,
				updated: 0,
				skipped: 0,
				errors: 0,
				ids: [upsertedProducer.id],
			};
		} catch (error) {
			console.error(
				`❌ DATABASE_ERROR: Failed to upsert producer ${producerData.mal_id}`,
				{
					entityType: "producer",
					entityId: producerData.mal_id,
					error: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
				},
			);
			return { inserted: 0, updated: 0, skipped: 0, errors: 1, ids: [] };
		}
	}

	private async processProducerPageFiltered(
		data: JikanResponse<ProducerData[]>,
		filter: (mal_id: number) => boolean,
	): Promise<DatabaseOperationResult> {
		const result: DatabaseOperationResult = {
			inserted: 0,
			updated: 0,
			skipped: 0,
			errors: 0,
			ids: [],
		};
		for (const producerData of data.data) {
			if (filter(producerData.mal_id)) {
				try {
					const itemResult = await this.upsertProducer(producerData);
					result.inserted += itemResult.inserted;
					result.updated += itemResult.updated;
					result.skipped += itemResult.skipped;
					result.errors += itemResult.errors;
					result.ids.push(...itemResult.ids);
				} catch (error) {
					result.errors++;
					console.error(`Error processing producer ${producerData.mal_id}:`, {
						id: producerData.mal_id,
						error: error instanceof Error ? error.message : String(error),
						stack: error instanceof Error ? error.stack : undefined,
					});
				}
			}
		}
		return result;
	}

	private async processProducerPageRange(
		data: JikanResponse<ProducerData[]>,
		startId: number,
	): Promise<DatabaseOperationResult> {
		return this.processProducerPageFiltered(
			data,
			(mal_id) => mal_id >= startId,
		);
	}
}
