import AnimeRepository from "@trackyrs/database/repositories/myanimelist/anime/anime-repository";
import AnimeToGenreRepository from "@trackyrs/database/repositories/myanimelist/anime/anime-to-genre-repository";
import AnimeToProducersRepository from "@trackyrs/database/repositories/myanimelist/anime/anime-to-producers-repository";
import type { NewAnimeMangaRelation } from "@trackyrs/database/repositories/myanimelist/anime-manga-relation-repository";
import AnimeMangaRelationRepository from "@trackyrs/database/repositories/myanimelist/anime-manga-relation-repository";
import {
	AnimeGenreRole,
	type NewAnimeToGenre,
} from "@trackyrs/database/schemas/myanimelist/anime/anime-to-genre-schema";
import {
	AnimeProducerRole,
	type NewAnimeToProducers,
} from "@trackyrs/database/schemas/myanimelist/anime/anime-to-producers-schema";
import { BaseFetcher } from "@/base-fetcher";
import { FetcherError, FetcherErrorType } from "@/fetcher-error";
import type {
	AnimeFullData,
	DatabaseOperationResult,
	JikanResponse,
	RelationInfo,
} from "@/types";

export class AnimeFullDetailsFetcher extends BaseFetcher {
	async insertAll(): Promise<DatabaseOperationResult> {
		return this.insertRange(1);
	}

	async insertSingle(id: number): Promise<DatabaseOperationResult> {
		try {
			return await this.processAnimeRelationships(id);
		} catch (error) {
			this.progressBar.stop();
			if (error instanceof FetcherError) {
				throw error;
			}
			throw new FetcherError(
				FetcherErrorType.UNKNOWN_ERROR,
				`Failed to update relationships for anime ${id}`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	}

	async insertRange(startId = 1): Promise<DatabaseOperationResult> {
		try {
			return await this.fetchRangeData<JikanResponse<AnimeFullData>>(
				`${this.baseUrl}/anime`,
				async (_id, data) => {
					if (!data || !data.data) {
						return { inserted: 0, updated: 0, skipped: 1, errors: 0 };
					}
					return await this.processAnimeRelationshipsFromData(data.data);
				},
				startId,
			);
		} catch (error) {
			if (error instanceof FetcherError) {
				throw error;
			}
			throw new FetcherError(
				FetcherErrorType.UNKNOWN_ERROR,
				`Failed to update relationships for anime range starting from ${startId}`,
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

		try {
			return await this.fetchRangeData<JikanResponse<AnimeFullData>>(
				`${this.baseUrl}/anime`,
				async (_id, data) => {
					if (!data || !data.data) {
						return { inserted: 0, updated: 0, skipped: 1, errors: 0 };
					}
					return await this.processAnimeRelationshipsFromData(data.data);
				},
				startId,
				endId,
			);
		} catch (error) {
			if (error instanceof FetcherError) {
				throw error;
			}
			throw new FetcherError(
				FetcherErrorType.UNKNOWN_ERROR,
				`Failed to update relationships for anime between ${startId} and ${endId}`,
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
		return this.insertFromList(ids);
	}

	private async processAnimeRelationships(
		animeId: number,
	): Promise<DatabaseOperationResult> {
		try {
			const data = await this.fetchJson<JikanResponse<AnimeFullData>>(
				`${this.baseUrl}/anime/${animeId}/full`,
			);

			if (!data || !data.data) {
				return { inserted: 0, updated: 0, skipped: 1, errors: 0 };
			}

			return await this.processAnimeRelationshipsFromData(data.data);
		} catch (error) {
			if (error instanceof FetcherError) {
				throw error;
			}
			return { inserted: 0, updated: 0, skipped: 0, errors: 1 };
		}
	}

	private async processAnimeRelationshipsFromData(
		animeData: AnimeFullData,
	): Promise<DatabaseOperationResult> {
		const result: DatabaseOperationResult = {
			inserted: 0,
			updated: 0,
			skipped: 0,
			errors: 0,
		};

		try {
			const existingAnime = await AnimeRepository.findById(animeData.mal_id);
			if (!existingAnime) {
				// Skip if anime doesn't exist - it should be inserted first using AnimeFetcher
				return { inserted: 0, updated: 0, skipped: 1, errors: 0 };
			}

			if (animeData.relations && animeData.relations.length > 0) {
				const relationResult = await this.processRelations(
					animeData.mal_id,
					animeData.relations,
				);
				result.inserted += relationResult.inserted;
				result.updated += relationResult.updated;
				result.skipped += relationResult.skipped;
				result.errors += relationResult.errors;
			}

			const genreResult = await this.processGenreRelationships(
				animeData.mal_id,
				animeData,
			);
			result.inserted += genreResult.inserted;
			result.updated += genreResult.updated;
			result.skipped += genreResult.skipped;
			result.errors += genreResult.errors;

			const producerResult = await this.processProducerRelationships(
				animeData.mal_id,
				animeData,
			);
			result.inserted += producerResult.inserted;
			result.updated += producerResult.updated;
			result.skipped += producerResult.skipped;
			result.errors += producerResult.errors;

			return result;
		} catch (error) {
			throw new FetcherError(
				FetcherErrorType.DATABASE_ERROR,
				`Failed to process relationships for anime ${animeData.mal_id}`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	}

	private async processRelations(
		animeId: number,
		relations: RelationInfo[],
	): Promise<DatabaseOperationResult> {
		const result: DatabaseOperationResult = {
			inserted: 0,
			updated: 0,
			skipped: 0,
			errors: 0,
		};

		try {
			const relationData: NewAnimeMangaRelation[] = [];

			for (const relation of relations) {
				for (const entry of relation.entry) {
					const newRelation: NewAnimeMangaRelation = {
						animeSourceId: animeId,
						type: relation.relation,
					};

					if (entry.type === "anime") {
						newRelation.animeDestinationId = entry.mal_id;
					} else if (entry.type === "manga") {
						newRelation.mangaDestinationId = entry.mal_id;
					}

					relationData.push(newRelation);
				}
			}

			if (relationData.length > 0) {
				await AnimeMangaRelationRepository.insertMany(relationData);
				result.inserted += relationData.length;
			}

			return result;
		} catch (error) {
			result.errors += 1;
			console.warn(`Error processing relations for anime ${animeId}:`, error);
			return result;
		}
	}

	private async processGenreRelationships(
		animeId: number,
		animeData: AnimeFullData,
	): Promise<DatabaseOperationResult> {
		const result: DatabaseOperationResult = {
			inserted: 0,
			updated: 0,
			skipped: 0,
			errors: 0,
		};

		try {
			const genreRelations: NewAnimeToGenre[] = [];

			const genreTypes = [
				{ genres: animeData.genres, role: AnimeGenreRole.GENRES },
				{
					genres: animeData.explicit_genres,
					role: AnimeGenreRole.EXPLICIT_GENRES,
				},
				{ genres: animeData.themes, role: AnimeGenreRole.THEMES },
				{ genres: animeData.demographics, role: AnimeGenreRole.DEMOGRAPHICS },
			];

			for (const { genres, role } of genreTypes) {
				if (genres && genres.length > 0) {
					for (const genre of genres) {
						genreRelations.push({
							animeId,
							genreId: genre.mal_id,
							role,
						});
					}
				}
			}

			if (genreRelations.length > 0) {
				await AnimeToGenreRepository.insertMany(genreRelations);
				result.inserted += genreRelations.length;
			}

			return result;
		} catch (error) {
			result.errors += 1;
			console.warn(
				`Error processing genre relationships for anime ${animeId}:`,
				error,
			);
			return result;
		}
	}

	private async processProducerRelationships(
		animeId: number,
		animeData: AnimeFullData,
	): Promise<DatabaseOperationResult> {
		const result: DatabaseOperationResult = {
			inserted: 0,
			updated: 0,
			skipped: 0,
			errors: 0,
		};

		try {
			const producerRelations: NewAnimeToProducers[] = [];

			const producerTypes = [
				{ producers: animeData.producers, role: AnimeProducerRole.PRODUCER },
				{ producers: animeData.licensors, role: AnimeProducerRole.LICENSOR },
				{ producers: animeData.studios, role: AnimeProducerRole.STUDIO },
			];

			for (const { producers, role } of producerTypes) {
				if (producers && producers.length > 0) {
					for (const producer of producers) {
						producerRelations.push({
							animeId,
							producerId: producer.mal_id,
							role,
						});
					}
				}
			}

			if (producerRelations.length > 0) {
				await AnimeToProducersRepository.insertMany(producerRelations);
				result.inserted += producerRelations.length;
			}

			return result;
		} catch (error) {
			result.errors += 1;
			console.warn(
				`Error processing producer relationships for anime ${animeId}:`,
				error,
			);
			return result;
		}
	}
}
