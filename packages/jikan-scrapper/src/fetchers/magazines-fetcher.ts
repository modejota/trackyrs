import MangaMagazineRepository from "@trackyrs/database/repositories/myanimelist/manga/manga-magazine-repository";
import type { NewMagazine } from "@trackyrs/database/schemas/myanimelist/manga/manga-magazine-schema";
import { BaseFetcher } from "@/base-fetcher";
import { MagazineMapper } from "@/mappers/magazine-mapper";
import type {
	DatabaseOperationResult,
	JikanResponse,
	MagazineData,
} from "@/types";

export class MagazinesFetcher extends BaseFetcher {
	async upsertAll(): Promise<DatabaseOperationResult> {
		return this.upsertRange(1);
	}

	async upsertSingle(id: number): Promise<DatabaseOperationResult> {
		try {
			return await this.processMagazineId(id);
		} catch (error) {
			this.stopProgress();
			console.error(`❌ Failed to upsert single magazine ${id}`, {
				entityType: "magazine",
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
			return await this.fetchPaginatedData<MagazineData>(
				`${this.baseUrl}/magazines`,
				(data) => this.processMagazinePageRange(data, startId),
				startPage,
				false,
			);
		} catch (error) {
			console.error(
				`❌ Failed to upsert magazine range starting from ${startId}`,
				{
					entityType: "magazine",
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
					console.error(`Error processing magazine ID ${id}:`, {
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

	private async processMagazineId(
		id: number,
	): Promise<DatabaseOperationResult> {
		try {
			const data = await this.fetchJson<JikanResponse<MagazineData>>(
				`${this.baseUrl}/magazines/${id}`,
			);

			if (!data || !data.data) {
				return { inserted: 0, updated: 0, skipped: 1, errors: 0, ids: [] };
			}

			return await this.upsertMagazine(data.data);
		} catch (error) {
			console.error(`❌ FETCH ERROR: Failed to fetch data for magazine ${id}`, {
				entityType: "anime-full-details",
				entityId: id,
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
			});
			return { inserted: 0, updated: 0, skipped: 0, errors: 1, ids: [] };
		}
	}

	private async upsertMagazine(
		magazineData: MagazineData,
	): Promise<DatabaseOperationResult> {
		try {
			const mappedData: NewMagazine =
				MagazineMapper.mapMagazineData(magazineData);

			const existingMagazine = await MangaMagazineRepository.findById(
				magazineData.mal_id,
			);

			const upsertedMagazine = await MangaMagazineRepository.upsert(mappedData);

			if (existingMagazine) {
				return {
					inserted: 0,
					updated: 1,
					skipped: 0,
					errors: 0,
					ids: [upsertedMagazine.id],
				};
			}
			return {
				inserted: 1,
				updated: 0,
				skipped: 0,
				errors: 0,
				ids: [upsertedMagazine.id],
			};
		} catch (error) {
			console.error(
				`❌ DATABASE_ERROR: Failed to upsert magazine ${magazineData.mal_id}`,
				{
					entityType: "magazine",
					entityId: magazineData.mal_id,
					error: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
				},
			);
			return { inserted: 0, updated: 0, skipped: 0, errors: 1, ids: [] };
		}
	}

	private async processMagazinePageFiltered(
		data: JikanResponse<MagazineData[]>,
		filter: (mal_id: number) => boolean,
	): Promise<DatabaseOperationResult> {
		const result: DatabaseOperationResult = {
			inserted: 0,
			updated: 0,
			skipped: 0,
			errors: 0,
			ids: [],
		};
		for (const magazineData of data.data) {
			if (filter(magazineData.mal_id)) {
				try {
					const itemResult = await this.upsertMagazine(magazineData);
					result.inserted += itemResult.inserted;
					result.updated += itemResult.updated;
					result.skipped += itemResult.skipped;
					result.errors += itemResult.errors;
					result.ids.push(...itemResult.ids);
				} catch (error) {
					result.errors++;
					console.error(`Error processing magazine ${magazineData.mal_id}:`, {
						id: magazineData.mal_id,
						error: error instanceof Error ? error.message : String(error),
						stack: error instanceof Error ? error.stack : undefined,
					});
				}
			}
		}
		return result;
	}

	private async processMagazinePageRange(
		data: JikanResponse<MagazineData[]>,
		startId: number,
	): Promise<DatabaseOperationResult> {
		return this.processMagazinePageFiltered(
			data,
			(mal_id) => mal_id >= startId,
		);
	}
}
