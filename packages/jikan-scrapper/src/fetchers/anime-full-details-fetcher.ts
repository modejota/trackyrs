import AnimeGenreRepository from "@trackyrs/database/repositories/myanimelist/anime/anime-genre-repository";
import AnimeProducerRepository from "@trackyrs/database/repositories/myanimelist/anime/anime-producer-repository";
import AnimeRepository from "@trackyrs/database/repositories/myanimelist/anime/anime-repository";
import AnimeToGenreRepository from "@trackyrs/database/repositories/myanimelist/anime/anime-to-genre-repository";
import AnimeToProducersRepository from "@trackyrs/database/repositories/myanimelist/anime/anime-to-producers-repository";
import AnimeMangaRelationRepository from "@trackyrs/database/repositories/myanimelist/anime-manga-relation-repository";
import MangaRepository from "@trackyrs/database/repositories/myanimelist/manga/manga-repository";
import {
	AnimeGenreRole,
	type NewAnimeToGenre,
} from "@trackyrs/database/schemas/myanimelist/anime/anime-to-genre-schema";
import {
	AnimeProducerRole,
	type NewAnimeToProducers,
} from "@trackyrs/database/schemas/myanimelist/anime/anime-to-producers-schema";
import type { NewAnimeMangaRelation } from "@trackyrs/database/schemas/myanimelist/anime-manga-relation";
import { BaseFetcher } from "@/base-fetcher";
import { AnimeFetcher } from "@/fetchers/anime-fetcher";
import { GenresFetcher } from "@/fetchers/genres-fetcher";
import { MangaFetcher } from "@/fetchers/manga-fetcher";
import { ProducersFetcher } from "@/fetchers/producers-fetcher";
import { AnimeMapper } from "@/mappers/anime-mapper";
import type {
	AnimeFullData,
	DatabaseOperationResult,
	JikanResponse,
	RelationInfo,
} from "@/types";

export class AnimeFullDetailsFetcher extends BaseFetcher {
	async upsertAll(): Promise<DatabaseOperationResult> {
		return this.upsertRange(1);
	}

	async upsertSingle(id: number): Promise<DatabaseOperationResult> {
		try {
			return await this.processAnimeRelationships(id);
		} catch (error) {
			this.stopProgress();
			console.error(`❌ Failed to upsert relationships for anime ${id}`, {
				entityType: "anime-full-details",
				entityId: id,
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
			});
			return { inserted: 0, updated: 0, skipped: 0, errors: 1, ids: [] };
		}
	}

	async upsertRange(startId = 1): Promise<DatabaseOperationResult> {
		try {
			const animeIds = await AnimeRepository.findIdsFromRange(startId);
			return this.upsertFromList(animeIds);
		} catch (error) {
			this.stopProgress();
			console.error(
				`❌ Failed to upsert relationships for anime starting at ${startId}`,
				{
					entityType: "anime-full-details",
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
					console.error(`Error processing anime ID ${id}:`, {
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

	private async processAnimeRelationships(
		animeId: number,
	): Promise<DatabaseOperationResult> {
		try {
			const data = await this.fetchJson<JikanResponse<AnimeFullData>>(
				`${this.baseUrl}/anime/${animeId}/full`,
			);

			if (!data || !data.data) {
				return { inserted: 0, updated: 0, skipped: 1, errors: 0, ids: [] };
			}

			return await this.processAnimeRelationshipsFromData(data.data);
		} catch (error) {
			console.error(
				`❌ FETCH ERROR: Failed to fetch full data for anime ${animeId}`,
				{
					entityType: "anime-full-details",
					entityId: animeId,
					error: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
				},
			);
			return { inserted: 0, updated: 0, skipped: 0, errors: 1, ids: [] };
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
			ids: [],
		};

		try {
			const existingAnime = await AnimeRepository.findById(animeData.mal_id);
			if (!existingAnime) {
				// Skip if anime doesn't exist - it should be inserted first using AnimeFetcher
				return { inserted: 0, updated: 0, skipped: 1, errors: 0, ids: [] };
			}

			await AnimeRepository.update(
				animeData.mal_id,
				AnimeMapper.mapAnimeThemeExternalStreamingDetails(animeData),
			);

			result.updated += 1;
			result.ids.push(animeData.mal_id);

			if (animeData.relations && animeData.relations.length > 0) {
				const relationResult = await this.processRelations(
					animeData.mal_id,
					animeData.relations,
				);
				result.inserted += relationResult.inserted;
				result.updated += relationResult.updated;
				result.skipped += relationResult.skipped;
				result.errors += relationResult.errors;
				result.ids.push(...relationResult.ids);
			}

			const genreResult = await this.processGenreRelationships(
				animeData.mal_id,
				animeData,
			);
			result.inserted += genreResult.inserted;
			result.updated += genreResult.updated;
			result.skipped += genreResult.skipped;
			result.errors += genreResult.errors;
			result.ids.push(...genreResult.ids);

			const producerResult = await this.processProducerRelationships(
				animeData.mal_id,
				animeData,
			);
			result.inserted += producerResult.inserted;
			result.updated += producerResult.updated;
			result.skipped += producerResult.skipped;
			result.errors += producerResult.errors;
			result.ids.push(...producerResult.ids);

			return result;
		} catch (error) {
			console.error(
				`❌ DATABASE_ERROR: Failed to process relationships for anime ${animeData.mal_id}`,
				{
					entityType: "anime-full-details",
					entityId: animeData.mal_id,
					error: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
				},
			);
			return { inserted: 0, updated: 0, skipped: 0, errors: 1, ids: [] };
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
			ids: [],
		};

		try {
			const relationData: NewAnimeMangaRelation[] = [];

			for (const relation of relations) {
				for (const entry of relation.entry) {
					if (entry.type === "anime") {
						const existingAnime = await AnimeRepository.findById(entry.mal_id);
						if (!existingAnime) {
							try {
								const childProgressName = this.createChildProgress(
									`Related Anime (${entry.mal_id})`,
									1,
								);
								const animeFetcher = new AnimeFetcher(childProgressName);
								await animeFetcher.upsertSingle(entry.mal_id);
								this.removeChildProgress(childProgressName);
							} catch (error) {
								console.warn(
									`Failed to fetch missing anime ${entry.mal_id} for relation:`,
									error,
								);
								continue; // Skip this relation if we can't fetch the dependency
							}
						}

						const newRelation: NewAnimeMangaRelation = {
							animeSourceId: animeId,
							animeDestinationId: entry.mal_id,
							type: relation.relation,
						};
						relationData.push(newRelation);
					} else if (entry.type === "manga") {
						const existingManga = await MangaRepository.findById(entry.mal_id);
						if (!existingManga) {
							try {
								const childProgressName = this.createChildProgress(
									`Related Manga (${entry.mal_id})`,
									1,
								);
								const mangaFetcher = new MangaFetcher(childProgressName);
								await mangaFetcher.upsertSingle(entry.mal_id);
								this.removeChildProgress(childProgressName);
							} catch (error) {
								console.warn(
									`Failed to fetch missing manga ${entry.mal_id} for relation:`,
									error,
								);
								continue; // Skip this relation if we can't fetch the dependency
							}
						}

						const newRelation: NewAnimeMangaRelation = {
							animeSourceId: animeId,
							mangaDestinationId: entry.mal_id,
							type: relation.relation,
						};
						relationData.push(newRelation);
					}
				}
			}

			if (relationData.length > 0) {
				await AnimeMangaRelationRepository.upsertMany(relationData);
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
			ids: [],
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

			const missingGenres = new Set<number>();
			for (const { genres } of genreTypes) {
				if (genres && genres.length > 0) {
					for (const genre of genres) {
						const existingGenre = await AnimeGenreRepository.findById(
							genre.mal_id,
						);
						if (!existingGenre) {
							missingGenres.add(genre.mal_id);
						}
					}
				}
			}

			if (missingGenres.size > 0) {
				try {
					const childProgressName = this.createChildProgress(
						`Genres (${missingGenres.size})`,
						missingGenres.size,
					);
					const genresFetcher = new GenresFetcher(childProgressName);
					await genresFetcher.upsertAll("anime");
					this.removeChildProgress(childProgressName);
				} catch (error) {
					console.warn("Failed to fetch missing anime genres:", error);
				}
			}

			for (const { genres, role } of genreTypes) {
				if (genres && genres.length > 0) {
					for (const genre of genres) {
						const existingGenre = await AnimeGenreRepository.findById(
							genre.mal_id,
						);
						if (existingGenre) {
							genreRelations.push(
								AnimeMapper.mapGenreRelation(animeId, genre.mal_id, role),
							);
						} else {
							console.warn(
								`Genre ${genre.mal_id} still missing after fetch attempt`,
							);
						}
					}
				}
			}

			if (genreRelations.length > 0) {
				await AnimeToGenreRepository.upsertMany(genreRelations);
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
			ids: [],
		};

		try {
			const producerRelations: NewAnimeToProducers[] = [];

			const producerTypes = [
				{ producers: animeData.producers, role: AnimeProducerRole.PRODUCER },
				{ producers: animeData.licensors, role: AnimeProducerRole.LICENSOR },
				{ producers: animeData.studios, role: AnimeProducerRole.STUDIO },
			];

			const missingProducerIds: number[] = [];
			for (const { producers } of producerTypes) {
				if (producers && producers.length > 0) {
					for (const producer of producers) {
						const existingProducer = await AnimeProducerRepository.findById(
							producer.mal_id,
						);
						if (!existingProducer) {
							missingProducerIds.push(producer.mal_id);
						}
					}
				}
			}

			if (missingProducerIds.length > 0) {
				try {
					const childProgressName = this.createChildProgress(
						`Producers (${missingProducerIds.length})`,
						missingProducerIds.length,
					);
					const producersFetcher = new ProducersFetcher(childProgressName);
					await producersFetcher.upsertFromList(missingProducerIds);
					this.removeChildProgress(childProgressName);
				} catch (error) {
					console.warn("Failed to fetch missing producers:", error);
				}
			}

			for (const { producers, role } of producerTypes) {
				if (producers && producers.length > 0) {
					for (const producer of producers) {
						const existingProducer = await AnimeProducerRepository.findById(
							producer.mal_id,
						);
						if (existingProducer) {
							producerRelations.push(
								AnimeMapper.mapProducerRelation(animeId, producer.mal_id, role),
							);
						} else {
							console.warn(
								`Producer ${producer.mal_id} still missing after fetch attempt`,
							);
						}
					}
				}
			}

			if (producerRelations.length > 0) {
				await AnimeToProducersRepository.upsertMany(producerRelations);
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
