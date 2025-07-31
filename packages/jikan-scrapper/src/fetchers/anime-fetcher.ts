import AnimeRepository from "@trackyrs/database/repositories/myanimelist/anime/anime-repository";
import type { NewAnime } from "@trackyrs/database/schemas/myanimelist/anime/anime-schema";
import { BaseFetcher } from "@/base-fetcher";
import { AnimeMapper } from "@/mappers/anime-mapper";
import type {
	AnimeData,
	DatabaseOperationResult,
	JikanResponse,
} from "@/types";

export class AnimeFetcher extends BaseFetcher {
	async upsertAll(): Promise<DatabaseOperationResult> {
		return this.upsertRange(1);
	}

	async upsertSingle(id: number): Promise<DatabaseOperationResult> {
		try {
			return await this.processAnimeId(id);
		} catch (error) {
			this.stopProgress();
			console.error(`❌ Failed to upsert single anime ${id}`, {
				entityType: "anime",
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
			return await this.fetchPaginatedData<AnimeData>(
				`${this.baseUrl}/anime`,
				(data) => this.processAnimePageRange(data, startId),
				startPage,
				false,
			);
		} catch (error) {
			console.error(
				`❌ Failed to upsert anime range starting from ${startId}`,
				{
					entityType: "anime",
					startId,
					error: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
				},
			);
			return { inserted: 0, updated: 0, skipped: 0, errors: 1, ids: [] };
		}
	}

	async upsertBySeason(
		year: number,
		season: string,
	): Promise<DatabaseOperationResult> {
		const validSeasons = ["winter", "spring", "summer", "fall"];
		if (!validSeasons.includes(season.toLowerCase())) {
			console.error(
				`❌ VALIDATION_ERROR: Invalid season: ${season}. Must be one of: ${validSeasons.join(", ")}`,
				{
					entityType: "anime",
					year,
					season,
					validSeasons,
				},
			);
			return { inserted: 0, updated: 0, skipped: 0, errors: 1, ids: [] };
		}
		try {
			return await this.fetchPaginatedData<AnimeData>(
				`${this.baseUrl}/seasons/${year}/${season.toLowerCase()}`,
				(data) => this.processSeasonPage(data),
				1,
				false,
			);
		} catch (error) {
			console.error(`❌ Failed to upsert anime for ${season} ${year}`, {
				entityType: "anime",
				year,
				season,
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
			});
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
				const result = await this.upsertSingle(id);
				totalResult.inserted += result.inserted;
				totalResult.updated += result.updated;
				totalResult.skipped += result.skipped;
				totalResult.errors += result.errors;
				totalResult.ids.push(...result.ids);

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

	private async processAnimeId(id: number): Promise<DatabaseOperationResult> {
		try {
			const data = await this.fetchJson<JikanResponse<AnimeData>>(
				`${this.baseUrl}/anime/${id}`,
			);

			if (!data || !data.data) {
				return { inserted: 0, updated: 0, skipped: 1, errors: 0, ids: [] };
			}

			return await this.upsertAnime(data.data);
		} catch (error) {
			console.error(`❌ Error processing anime ID ${id}`, {
				entityType: "anime",
				entityId: id,
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
			});
			return { inserted: 0, updated: 0, skipped: 0, errors: 1, ids: [] };
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
			ids: [],
		};

		for (const animeData of data.data) {
			try {
				const itemResult = await this.upsertAnime(animeData);
				result.inserted += itemResult.inserted;
				result.updated += itemResult.updated;
				result.skipped += itemResult.skipped;
				result.errors += itemResult.errors;
				result.ids.push(...itemResult.ids);
			} catch (error) {
				result.errors++;
				console.error(`Error processing anime ${animeData.mal_id}:`, {
					id: animeData.mal_id,
					error: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
				});
			}
		}

		return result;
	}

	private async upsertAnime(
		animeData: AnimeData,
	): Promise<DatabaseOperationResult> {
		try {
			const mappedData: NewAnime = AnimeMapper.mapAnimeData(animeData);
			const existingAnime = await AnimeRepository.findById(animeData.mal_id);

			const upsertedAnime = await AnimeRepository.upsert(mappedData);

			if (existingAnime) {
				return {
					inserted: 0,
					updated: 1,
					skipped: 0,
					errors: 0,
					ids: [upsertedAnime.id],
				};
			}
			return {
				inserted: 1,
				updated: 0,
				skipped: 0,
				errors: 0,
				ids: [upsertedAnime.id],
			};
		} catch (error) {
			console.error(
				`❌ DATABASE_ERROR: Failed to upsert anime ${animeData.mal_id}`,
				{
					entityType: "anime",
					entityId: animeData.mal_id,
					error: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
				},
			);
			return { inserted: 0, updated: 0, skipped: 0, errors: 1, ids: [] };
		}
	}

	private async processAnimePageFiltered(
		data: JikanResponse<AnimeData[]>,
		filter: (mal_id: number) => boolean,
	): Promise<DatabaseOperationResult> {
		const result: DatabaseOperationResult = {
			inserted: 0,
			updated: 0,
			skipped: 0,
			errors: 0,
			ids: [],
		};
		for (const animeData of data.data) {
			if (filter(animeData.mal_id)) {
				try {
					const itemResult = await this.upsertAnime(animeData);
					result.inserted += itemResult.inserted;
					result.updated += itemResult.updated;
					result.skipped += itemResult.skipped;
					result.errors += itemResult.errors;
					result.ids.push(...itemResult.ids);
				} catch (error) {
					result.errors++;
					console.error(`Error processing anime ${animeData.mal_id}:`, {
						id: animeData.mal_id,
						error: error instanceof Error ? error.message : String(error),
						stack: error instanceof Error ? error.stack : undefined,
					});
				}
			}
		}
		return result;
	}

	private async processAnimePageRange(
		data: JikanResponse<AnimeData[]>,
		startId: number,
	): Promise<DatabaseOperationResult> {
		return this.processAnimePageFiltered(data, (mal_id) => mal_id >= startId);
	}
}
