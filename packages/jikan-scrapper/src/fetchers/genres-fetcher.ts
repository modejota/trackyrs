import AnimeGenreRepository from "@trackyrs/database/repositories/myanimelist/anime/anime-genre-repository";
import MangaGenreRepository from "@trackyrs/database/repositories/myanimelist/manga/manga-genre-repository";
import type { NewAnimeGenre } from "@trackyrs/database/schemas/myanimelist/anime/anime-genre-schema";
import type { NewMangaGenre } from "@trackyrs/database/schemas/myanimelist/manga/manga-genre-schema";
import { BaseFetcher } from "@/base-fetcher";
import { FetcherError, FetcherErrorType } from "@/fetcher-error";
import { GenreMapper } from "@/mappers/genre-mapper";
import type {
	DatabaseOperationResult,
	GenreData,
	JikanResponse,
} from "@/types";

export class GenresFetcher extends BaseFetcher {
	async insertAll(type: "anime" | "manga"): Promise<DatabaseOperationResult> {
		if (type !== "anime" && type !== "manga") {
			throw new FetcherError(
				FetcherErrorType.VALIDATION_ERROR,
				`Invalid genre type: ${type}. Must be 'anime' or 'manga'`,
			);
		}
		try {
			this.resetProgress();
			this.progressBar.start(1, 0);

			const result = await this.fetchGenreData(type);

			this.progressBar.stop();
			return result;
		} catch (error) {
			this.progressBar.stop();
			if (error instanceof FetcherError) {
				throw error;
			}
			throw new FetcherError(
				FetcherErrorType.DATABASE_ERROR,
				`Failed to insert all ${type} genres`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	}

	/**
	 * Not applicable for genres - use insertAll instead
	 */
	async insertSingle(_id: number): Promise<DatabaseOperationResult> {
		throw new FetcherError(
			FetcherErrorType.VALIDATION_ERROR,
			"insertSingle is not applicable for genres. Use insertAll('anime') or insertAll('manga') instead.",
		);
	}

	/**
	 * Not applicable for genres - use insertAll instead
	 */
	async insertRange(_startId?: number): Promise<DatabaseOperationResult> {
		throw new FetcherError(
			FetcherErrorType.VALIDATION_ERROR,
			"insertRange is not applicable for genres. Use insertAll('anime') or insertAll('manga') instead.",
		);
	}

	/**
	 * Not applicable for genres - use insertAll instead
	 */
	async insertBetween(
		_startId: number,
		_endId: number,
	): Promise<DatabaseOperationResult> {
		throw new FetcherError(
			FetcherErrorType.VALIDATION_ERROR,
			"insertBetween is not applicable for genres. Use insertAll('anime') or insertAll('manga') instead.",
		);
	}

	private async fetchGenreData(
		type: "anime" | "manga",
	): Promise<DatabaseOperationResult> {
		try {
			const data = await this.fetchJson<JikanResponse<GenreData[]>>(
				`${this.baseUrl}/genres/${type}`,
			);

			if (!data || !data.data) {
				return { inserted: 0, updated: 0, skipped: 0, errors: 1 };
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
				};
			}

			this.operationProgress.total = validGenres.length;
			this.progressBar.setTotal(validGenres.length);

			const result: DatabaseOperationResult = {
				inserted: 0,
				updated: 0,
				skipped: 0,
				errors: 0,
			};

			const batchSize = 20;
			for (let i = 0; i < validGenres.length; i += batchSize) {
				const batch = validGenres.slice(i, i + batchSize);

				const batchPromises = batch.map(async (genreData) => {
					try {
						const genreResult = await this.insertOrUpdateGenre(genreData, type);
						return {
							success: true,
							result: genreResult,
							genreId: genreData.mal_id,
						};
					} catch (error) {
						console.warn(`Error processing genre ${genreData.mal_id}:`, error);
						return {
							success: false,
							result: { inserted: 0, updated: 0, skipped: 0, errors: 1 },
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

					this.operationProgress.processed++;
					this.operationProgress.inserted = result.inserted;
					this.operationProgress.updated = result.updated;
					this.operationProgress.skipped = result.skipped;
					this.operationProgress.errors = result.errors;
					this.progressBar.update(this.operationProgress.processed);
				}

				// Small delay between batches to prevent overwhelming the database
				if (i + batchSize < validGenres.length) {
					await new Promise((resolve) => setTimeout(resolve, 100));
				}
			}

			return result;
		} catch (error) {
			if (error instanceof FetcherError) {
				throw error;
			}
			throw new FetcherError(
				FetcherErrorType.NETWORK_ERROR,
				`Failed to fetch ${type} genres from API`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	}

	private async insertOrUpdateGenre(
		genreData: GenreData,
		type: "anime" | "manga",
	): Promise<DatabaseOperationResult> {
		try {
			if (type === "anime") {
				return await this.insertOrUpdateAnimeGenre(genreData);
			}
			return await this.insertOrUpdateMangaGenre(genreData);
		} catch (error) {
			throw new FetcherError(
				FetcherErrorType.DATABASE_ERROR,
				`Failed to insert/update ${type} genre ${genreData.mal_id}`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	}

	private async insertOrUpdateAnimeGenre(
		genreData: GenreData,
	): Promise<DatabaseOperationResult> {
		const mappedData: NewAnimeGenre = GenreMapper.mapAnimeGenreData(genreData);
		await AnimeGenreRepository.insert(mappedData);
		return { inserted: 1, updated: 0, skipped: 0, errors: 0 };
	}

	private async insertOrUpdateMangaGenre(
		genreData: GenreData,
	): Promise<DatabaseOperationResult> {
		const mappedData: NewMangaGenre = GenreMapper.mapMangaGenreData(genreData);
		await MangaGenreRepository.insert(mappedData);
		return { inserted: 1, updated: 0, skipped: 0, errors: 0 };
	}
}
