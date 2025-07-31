import AnimeEpisodeRepository from "@trackyrs/database/repositories/myanimelist/anime/anime-episode-repository";
import AnimeRepository from "@trackyrs/database/repositories/myanimelist/anime/anime-repository";
import type { NewAnimeEpisode } from "@trackyrs/database/schemas/myanimelist/anime/anime-episode-schema";
import { BaseFetcher } from "@/base-fetcher";
import { AnimeFetcher } from "@/fetchers/anime-fetcher";
import { AnimeMapper } from "@/mappers/anime-mapper";
import type {
	AnimeEpisodesResponse,
	DatabaseOperationResult,
	EpisodeData,
} from "@/types";

export class AnimeEpisodesFetcher extends BaseFetcher {
	async upsertAll(): Promise<DatabaseOperationResult> {
		return this.upsertRange(1);
	}

	async upsertSingle(animeId: number): Promise<DatabaseOperationResult> {
		try {
			return await this.processAnimeEpisodes(animeId);
		} catch (error) {
			this.stopProgress();
			console.error(`❌ Failed to upsert episodes for anime ${animeId}`, {
				entityType: "anime-episodes",
				entityId: animeId,
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
			});
			return { inserted: 0, updated: 0, skipped: 0, errors: 1, ids: [] };
		}
	}

	async upsertRange(startId?: number): Promise<DatabaseOperationResult> {
		try {
			const animeIds = await this.getAnimeIdsFromRange(startId);
			return this.upsertFromList(animeIds);
		} catch (error) {
			this.stopProgress();
			console.error(
				`❌ Failed to upsert episodes for anime range starting from ${startId}`,
				{
					entityType: "anime-episodes",
					startId,
					error: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
				},
			);
			return { inserted: 0, updated: 0, skipped: 0, errors: 1, ids: [] };
		}
	}

	async upsertFromList(ids: number[]): Promise<DatabaseOperationResult> {
		return this.processAnimeIdList(ids);
	}

	private async processAnimeIdList(
		animeIds: number[],
	): Promise<DatabaseOperationResult> {
		if (animeIds.length === 0) {
			return { inserted: 0, updated: 0, skipped: 0, errors: 0, ids: [] };
		}
		this.resetProgress();
		this.startProgress(animeIds.length);

		const totalResult: DatabaseOperationResult = {
			inserted: 0,
			updated: 0,
			skipped: 0,
			errors: 0,
			ids: [],
		};

		for (const animeId of animeIds) {
			try {
				const existingAnime = await AnimeRepository.findById(animeId);
				if (!existingAnime) {
					try {
						const childProgressName = this.createChildProgress(
							`Anime (${animeId})`,
							1,
						);
						const animeFetcher = new AnimeFetcher(childProgressName);
						await animeFetcher.upsertSingle(animeId);
						this.removeChildProgress(childProgressName);
					} catch (error) {
						console.warn(
							`Failed to fetch missing anime ${animeId} for episodes:`,
							error,
						);
						totalResult.errors++;
						continue; // Skip processing episodes if we can't fetch the anime
					}
				}

				const result = await this.processAnimeEpisodes(animeId);
				totalResult.inserted += result.inserted;
				totalResult.updated += result.updated;
				totalResult.skipped += result.skipped;
				totalResult.errors += result.errors;
				totalResult.ids.push(...result.ids);
			} catch (error) {
				totalResult.errors++;
				console.error(`Error processing episodes for anime ID ${animeId}:`, {
					id: animeId,
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

		this.stopProgress();
		return totalResult;
	}

	private async processAnimeEpisodes(
		animeId: number,
	): Promise<DatabaseOperationResult> {
		try {
			let currentPage = 1;
			let hasNextPage = true;
			const totalResult: DatabaseOperationResult = {
				inserted: 0,
				updated: 0,
				skipped: 0,
				errors: 0,
				ids: [],
			};

			while (hasNextPage) {
				const episodesData = await this.fetchJson<AnimeEpisodesResponse>(
					`${this.baseUrl}/anime/${animeId}/episodes?page=${currentPage}`,
				);

				if (
					!episodesData ||
					!episodesData.data ||
					episodesData.data.length === 0
				) {
					hasNextPage = false;
					continue;
				}

				const pageResult = await this.processEpisodesPage(
					animeId,
					episodesData.data,
				);

				totalResult.inserted += pageResult.inserted;
				totalResult.updated += pageResult.updated;
				totalResult.skipped += pageResult.skipped;
				totalResult.errors += pageResult.errors;
				totalResult.ids.push(...pageResult.ids);

				hasNextPage = episodesData.pagination?.has_next_page === true;
				currentPage++;
			}

			return totalResult;
		} catch (error) {
			console.error(
				`❌ FETCH ERROR: Failed to fetch episodes data for anime ${animeId}`,
				{
					entityType: "anime-episodes",
					entityId: animeId,
					error: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
				},
			);
			return { inserted: 0, updated: 0, skipped: 0, errors: 1, ids: [] };
		}
	}

	private async processEpisodesPage(
		animeId: number,
		episodes: EpisodeData[],
	): Promise<DatabaseOperationResult> {
		const result: DatabaseOperationResult = {
			inserted: 0,
			updated: 0,
			skipped: 0,
			errors: 0,
			ids: [],
		};

		const episodesToUpsert: NewAnimeEpisode[] = [];

		for (const episodeData of episodes) {
			try {
				const mappedEpisode = AnimeMapper.mapEpisodeData(animeId, episodeData);
				episodesToUpsert.push(mappedEpisode);
			} catch (error) {
				result.errors++;
				console.warn(
					`Error processing episode ${episodeData.mal_id} for anime ${animeId}:`,
					error,
				);
			}
		}

		if (episodesToUpsert.length > 0) {
			try {
				const existingEpisodes = new Set<string>();
				for (const episode of episodesToUpsert) {
					const exists = await AnimeEpisodeRepository.exists(
						episode.animeId,
						episode.episodeNumber,
					);
					if (exists) {
						existingEpisodes.add(`${episode.animeId}-${episode.episodeNumber}`);
					}
				}

				const upsertedEpisodes =
					await AnimeEpisodeRepository.upsertMany(episodesToUpsert);

				for (const episode of episodesToUpsert) {
					const key = `${episode.animeId}-${episode.episodeNumber}`;
					if (existingEpisodes.has(key)) {
						result.updated++;
					} else {
						result.inserted++;
					}
				}

				result.ids.push(...upsertedEpisodes.map((ep) => ep.id));
			} catch (error) {
				result.errors += episodesToUpsert.length;
				console.warn(
					`Error batch upserting episodes for anime ${animeId}:`,
					error,
				);
			}
		}

		return result;
	}

	private async getAnimeIdsFromRange(startId?: number): Promise<number[]> {
		try {
			return await AnimeRepository.findIdsFromRange(startId);
		} catch (error) {
			console.error(
				`❌ DATABASE_ERROR: Failed to get anime IDs from range starting at ${startId}`,
				{
					entityType: "anime-episodes",
					startId,
					error: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
				},
			);
			return [];
		}
	}
}
