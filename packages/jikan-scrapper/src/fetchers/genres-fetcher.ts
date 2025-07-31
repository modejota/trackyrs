import AnimeGenreRepository from "@trackyrs/database/repositories/myanimelist/anime/anime-genre-repository";
import MangaGenreRepository from "@trackyrs/database/repositories/myanimelist/manga/manga-genre-repository";
import type { NewAnimeGenre } from "@trackyrs/database/schemas/myanimelist/anime/anime-genre-schema";
import type { NewMangaGenre } from "@trackyrs/database/schemas/myanimelist/manga/manga-genre-schema";
import { BaseFetcher } from "@/base-fetcher";
import { GenreMapper } from "@/mappers/genre-mapper";
import type {
	DatabaseOperationResult,
	GenreData,
	JikanResponse,
} from "@/types";

export class GenresFetcher extends BaseFetcher {
	async upsertAll(type: "anime" | "manga"): Promise<DatabaseOperationResult> {
		if (type !== "anime" && type !== "manga") {
			console.error(
				`❌ VALIDATION_ERROR: Invalid genre type: ${type}. Must be 'anime' or 'manga'`,
				{
					entityType: "genre",
					type,
					validTypes: ["anime", "manga"],
				},
			);
			return { inserted: 0, updated: 0, skipped: 0, errors: 1, ids: [] };
		}
		try {
			this.resetProgress();
			this.startProgress(1);

			const result = await this.fetchGenreData(type);

			this.stopProgress();
			return result;
		} catch (error) {
			this.stopProgress();
			console.error(`❌ Failed to upsert all ${type} genres`, {
				entityType: "genre",
				type,
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
			});
			return { inserted: 0, updated: 0, skipped: 0, errors: 1, ids: [] };
		}
	}

	/**
	 * Not applicable for genres - use upsertAll instead
	 */
	async upsertSingle(_id: number): Promise<DatabaseOperationResult> {
		console.error(
			`❌ VALIDATION_ERROR: upsertSingle is not applicable for genres. Use upsertAll('anime') or upsertAll('manga') instead.`,
			{
				entityType: "genre",
				method: "upsertSingle",
				suggestion: "Use upsertAll('anime') or upsertAll('manga') instead",
			},
		);
		return { inserted: 0, updated: 0, skipped: 0, errors: 1, ids: [] };
	}

	/**
	 * Not applicable for genres - use upsertAll instead
	 */
	async upsertRange(_startId?: number): Promise<DatabaseOperationResult> {
		console.error(
			`❌ VALIDATION_ERROR: upsertRange is not applicable for genres. Use upsertAll('anime') or upsertAll('manga') instead.`,
			{
				entityType: "genre",
				method: "upsertRange",
				suggestion: "Use upsertAll('anime') or upsertAll('manga') instead",
			},
		);
		return { inserted: 0, updated: 0, skipped: 0, errors: 1, ids: [] };
	}
	/**
	 * Not applicable for genres - use upsertAll instead
	 */
	async upsertFromList(_ids: number[]): Promise<DatabaseOperationResult> {
		console.error(
			`❌ VALIDATION_ERROR: upsertFromList is not applicable for genres. Use upsertAll('anime') or upsertAll('manga') instead.`,
			{
				entityType: "genre",
				method: "upsertFromList",
				suggestion: "Use upsertAll('anime') or upsertAll('manga') instead",
			},
		);
		return { inserted: 0, updated: 0, skipped: 0, errors: 1, ids: [] };
	}

	private async fetchGenreData(
		type: "anime" | "manga",
	): Promise<DatabaseOperationResult> {
		try {
			const data = await this.fetchJson<JikanResponse<GenreData[]>>(
				`${this.baseUrl}/genres/${type}`,
			);

			if (!data || !data.data) {
				return { inserted: 0, updated: 0, skipped: 0, errors: 1, ids: [] };
			}

			const genreMap = new Map<number, GenreData>();
			for (const genre of data.data) {
				if (!genreMap.has(genre.mal_id)) {
					genreMap.set(genre.mal_id, genre);
				}
			}
			const validGenres = Array.from(genreMap.values());

			if (validGenres.length === 0) {
				return {
					inserted: 0,
					updated: 0,
					skipped: 0,
					errors: data.data.length,
					ids: [],
				};
			}

			this.operationProgress.total = validGenres.length;
			this.updateProgress(0);

			const result: DatabaseOperationResult = {
				inserted: 0,
				updated: 0,
				skipped: 0,
				errors: 0,
				ids: [],
			};

			const batchSize = 20;
			for (let i = 0; i < validGenres.length; i += batchSize) {
				const batch = validGenres.slice(i, i + batchSize);

				const batchPromises = batch.map(async (genreData) => {
					try {
						const genreResult = await this.upsertGenre(genreData, type);
						return {
							success: true,
							result: genreResult,
							genreId: genreData.mal_id,
						};
					} catch (error) {
						console.error(`Error processing genre ${genreData.mal_id}:`, {
							id: genreData.mal_id,
							type,
							error: error instanceof Error ? error.message : String(error),
							stack: error instanceof Error ? error.stack : undefined,
						});
						return {
							success: false,
							result: {
								inserted: 0,
								updated: 0,
								skipped: 0,
								errors: 1,
								ids: [],
							},
							genreId: genreData.mal_id,
						};
					}
				});

				const batchResults = await Promise.all(batchPromises);

				for (const batchResult of batchResults) {
					result.inserted += batchResult.result.inserted;
					result.updated += batchResult.result.updated;
					result.skipped += batchResult.result.skipped;
					result.errors += batchResult.result.errors;
					result.ids.push(...batchResult.result.ids);

					this.operationProgress.processed++;
					this.operationProgress.inserted = result.inserted;
					this.operationProgress.updated = result.updated;
					this.operationProgress.skipped = result.skipped;
					this.operationProgress.errors = result.errors;
					this.updateProgress(this.operationProgress.processed);
				}
			}

			return result;
		} catch (error) {
			console.error(
				`❌ NETWORK_ERROR: Failed to fetch ${type} genres from API`,
				{
					entityType: "genre",
					type,
					error: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
				},
			);
			return { inserted: 0, updated: 0, skipped: 0, errors: 1, ids: [] };
		}
	}

	private async upsertGenre(
		genreData: GenreData,
		type: "anime" | "manga",
	): Promise<DatabaseOperationResult> {
		try {
			if (type === "anime") {
				return await this.upsertAnimeGenre(genreData);
			}
			return await this.upsertMangaGenre(genreData);
		} catch (error) {
			console.error(
				`❌ DATABASE_ERROR: Failed to upsert ${type} genre ${genreData.mal_id}`,
				{
					entityType: "genre",
					entityId: genreData.mal_id,
					type,
					error: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
				},
			);
			return { inserted: 0, updated: 0, skipped: 0, errors: 1, ids: [] };
		}
	}

	private async upsertAnimeGenre(
		genreData: GenreData,
	): Promise<DatabaseOperationResult> {
		const mappedData: NewAnimeGenre = GenreMapper.mapAnimeGenreData(genreData);
		const existingGenre = await AnimeGenreRepository.findById(genreData.mal_id);

		const upsertedGenre = await AnimeGenreRepository.upsert(mappedData);

		if (existingGenre) {
			return {
				inserted: 0,
				updated: 1,
				skipped: 0,
				errors: 0,
				ids: [upsertedGenre.id],
			};
		}
		return {
			inserted: 1,
			updated: 0,
			skipped: 0,
			errors: 0,
			ids: [upsertedGenre.id],
		};
	}

	private async upsertMangaGenre(
		genreData: GenreData,
	): Promise<DatabaseOperationResult> {
		const mappedData: NewMangaGenre = GenreMapper.mapMangaGenreData(genreData);
		const existingGenre = await MangaGenreRepository.findById(genreData.mal_id);

		const upsertedGenre = await MangaGenreRepository.upsert(mappedData);

		if (existingGenre) {
			return {
				inserted: 0,
				updated: 1,
				skipped: 0,
				errors: 0,
				ids: [upsertedGenre.id],
			};
		}
		return {
			inserted: 1,
			updated: 0,
			skipped: 0,
			errors: 0,
			ids: [upsertedGenre.id],
		};
	}
}
