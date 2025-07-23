import AnimeRepository from "@trackyrs/database/repositories/myanimelist/anime/anime-repository";
import AnimeToCharacterRepository from "@trackyrs/database/repositories/myanimelist/anime/anime-to-character-repository";
import AnimeToPeopleRepository from "@trackyrs/database/repositories/myanimelist/anime/anime-to-people-repository";
import CharacterToPeopleRepository from "@trackyrs/database/repositories/myanimelist/character/character-to-people-repository";
import { BaseFetcher } from "@/base-fetcher";
import { FetcherError, FetcherErrorType } from "@/fetcher-error";
import { AnimeMapper } from "@/mappers/anime-mapper";
import type {
	AnimeCharacterData,
	AnimeStaffData,
	DatabaseOperationResult,
	JikanResponse,
} from "@/types";

export class AnimeCharactersStaffFetcher extends BaseFetcher {
	async insertAll(): Promise<DatabaseOperationResult> {
		return this.insertRange(1);
	}

	async insertSingle(id: number): Promise<DatabaseOperationResult> {
		try {
			return await this.processAnimeCharactersAndStaff(id);
		} catch (error) {
			if (error instanceof FetcherError) {
				throw error;
			}
			throw new FetcherError(
				FetcherErrorType.UNKNOWN_ERROR,
				`Failed to insert characters and staff for anime ${id}`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	}

	async insertRange(startId?: number): Promise<DatabaseOperationResult> {
		try {
			const animeIds = startId
				? await AnimeRepository.findIdsFromRangeGreaterThanOrEqual(startId)
				: await AnimeRepository.findAllIds();

			const result = await this.processAnimeList(animeIds);
			return result;
		} catch (error) {
			if (error instanceof FetcherError) {
				throw error;
			}
			throw new FetcherError(
				FetcherErrorType.UNKNOWN_ERROR,
				`Failed to insert characters and staff for anime range starting from ${startId}`,
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
			const animeIds = await AnimeRepository.findIdsBetween(startId, endId);
			return await this.processAnimeList(animeIds);
		} catch (error) {
			if (error instanceof FetcherError) {
				throw error;
			}
			throw new FetcherError(
				FetcherErrorType.UNKNOWN_ERROR,
				`Failed to insert characters and staff for anime between ${startId} and ${endId}`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	}

	async insertFromList(ids: number[]): Promise<DatabaseOperationResult> {
		return this.processAnimeList(ids);
	}

	async updateFromList(ids: number[]): Promise<DatabaseOperationResult> {
		return this.processAnimeList(ids);
	}

	private async processAnimeList(
		animeIds: number[],
	): Promise<DatabaseOperationResult> {
		if (animeIds.length === 0)
			return { inserted: 0, updated: 0, skipped: 0, errors: 0 };

		this.resetProgress();
		this.operationProgress.total = animeIds.length;
		this.progressBar.start(animeIds.length, 0);

		const totalResult: DatabaseOperationResult = {
			inserted: 0,
			updated: 0,
			skipped: 0,
			errors: 0,
		};

		try {
			for (const animeId of animeIds) {
				try {
					const result = await this.processAnimeCharactersAndStaff(animeId);
					totalResult.inserted += result.inserted;
					totalResult.updated += result.updated;
					totalResult.skipped += result.skipped;
					totalResult.errors += result.errors;
				} catch (error) {
					totalResult.errors++;
					console.warn(`Error processing anime ${animeId}:`, error);
				}

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

	private async processAnimeCharactersAndStaff(
		animeId: number,
	): Promise<DatabaseOperationResult> {
		const result: DatabaseOperationResult = {
			inserted: 0,
			updated: 0,
			skipped: 0,
			errors: 0,
		};

		try {
			const charactersData = await this.fetchJson<
				JikanResponse<AnimeCharacterData[]>
			>(`${this.baseUrl}/anime/${animeId}/characters`);

			if (charactersData?.data) {
				const characterRelations = charactersData.data
					.map((character) =>
						AnimeMapper.mapCharacterRelation(animeId, character),
					)
					.filter(
						(relation): relation is NonNullable<typeof relation> =>
							relation !== null,
					);

				if (characterRelations.length > 0) {
					const characterResult =
						await AnimeToCharacterRepository.insertMany(characterRelations);
					result.inserted += characterResult.rowCount ?? 0;

					const characterToPeopleRelations = charactersData.data.flatMap(
						(character) => {
							const characterId = character.character.mal_id;
							if (!characterId) return [];
							return AnimeMapper.mapCharacterToPeopleRelation(
								characterId,
								character,
							);
						},
					);

					if (characterToPeopleRelations.length > 0) {
						const characterToPeopleResult =
							await CharacterToPeopleRepository.insertMany(
								characterToPeopleRelations,
							);
						result.inserted += characterToPeopleResult.rowCount ?? 0;
					}
				}
			}

			const staffData = await this.fetchJson<JikanResponse<AnimeStaffData[]>>(
				`${this.baseUrl}/anime/${animeId}/staff`,
			);

			if (staffData?.data) {
				const staffRelations = staffData.data
					.map((staff) => AnimeMapper.mapStaffRelation(animeId, staff))
					.filter(
						(relation): relation is NonNullable<typeof relation> =>
							relation !== null,
					);

				if (staffRelations.length > 0) {
					const staffResult =
						await AnimeToPeopleRepository.insertMany(staffRelations);
					result.inserted += staffResult.rowCount ?? 0;
				}
			}

			return result;
		} catch (error) {
			if (error instanceof FetcherError) {
				throw error;
			}
			throw new FetcherError(
				FetcherErrorType.DATABASE_ERROR,
				`Failed to process characters and staff for anime ${animeId}`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	}
}
