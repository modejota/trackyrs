import AnimeRepository from "@trackyrs/database/repositories/myanimelist/anime/anime-repository";
import AnimeToCharacterRepository from "@trackyrs/database/repositories/myanimelist/anime/anime-to-character-repository";
import AnimeToPeopleRepository from "@trackyrs/database/repositories/myanimelist/anime/anime-to-people-repository";
import CharacterRepository from "@trackyrs/database/repositories/myanimelist/character/character-repository";
import CharacterToPeopleRepository from "@trackyrs/database/repositories/myanimelist/character/character-to-people-repository";
import PeopleRepository from "@trackyrs/database/repositories/myanimelist/people-repository";
import { BaseFetcher } from "@/base-fetcher";
import { CharactersFetcher } from "@/fetchers/characters-fetcher";
import { PeopleFetcher } from "@/fetchers/people-fetcher";
import { AnimeMapper } from "@/mappers/anime-mapper";
import type {
	AnimeCharacterData,
	AnimeStaffData,
	DatabaseOperationResult,
	JikanResponse,
} from "@/types";

export class AnimeCharactersStaffFetcher extends BaseFetcher {
	async upsertAll(): Promise<DatabaseOperationResult> {
		return this.upsertRange(1);
	}

	async upsertSingle(id: number): Promise<DatabaseOperationResult> {
		try {
			return await this.processAnimeCharactersAndStaff(id);
		} catch (error) {
			this.stopProgress();
			console.error(
				`❌ Failed to upsert characters and staff for anime ${id}`,
				{
					entityType: "anime-characters-staff",
					entityId: id,
					error: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
				},
			);
			return { inserted: 0, updated: 0, skipped: 0, errors: 1, ids: [] };
		}
	}

	async upsertRange(startId = 1): Promise<DatabaseOperationResult> {
		try {
			const animeIds =
				await AnimeRepository.findIdsFromRangeGreaterThanOrEqual(startId);
			return await this.upsertFromList(animeIds);
		} catch (error) {
			this.stopProgress();
			console.error(
				`❌ Failed to upsert characters and staff for anime range starting from ${startId}`,
				{
					entityType: "anime-characters-staff",
					startId,
					error: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
				},
			);
			return { inserted: 0, updated: 0, skipped: 0, errors: 1, ids: [] };
		}
	}

	async upsertFromList(ids: number[]): Promise<DatabaseOperationResult> {
		return this.processAnimeList(ids);
	}

	private async processAnimeList(
		animeIds: number[],
	): Promise<DatabaseOperationResult> {
		if (animeIds.length === 0)
			return { inserted: 0, updated: 0, skipped: 0, errors: 0, ids: [] };

		this.resetProgress();
		this.startProgress(animeIds.length);

		const totalResult: DatabaseOperationResult = {
			inserted: 0,
			updated: 0,
			skipped: 0,
			errors: 0,
			ids: [],
		};

		try {
			for (const animeId of animeIds) {
				try {
					const result = await this.processAnimeCharactersAndStaff(animeId);
					totalResult.inserted += result.inserted;
					totalResult.updated += result.updated;
					totalResult.skipped += result.skipped;
					totalResult.errors += result.errors;
					totalResult.ids.push(...result.ids);
				} catch (error) {
					totalResult.errors++;
					console.error(`Error processing anime ID ${animeId}:`, {
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

			return totalResult;
		} finally {
			this.stopProgress();
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
			ids: [],
		};

		try {
			const charactersData = await this.fetchJson<
				JikanResponse<AnimeCharacterData[]>
			>(`${this.baseUrl}/anime/${animeId}/characters`);

			if (charactersData?.data) {
				const missingCharacterIds: number[] = [];
				for (const character of charactersData.data) {
					if (character.character?.mal_id) {
						const existingCharacter = await CharacterRepository.findById(
							character.character.mal_id,
						);
						if (!existingCharacter) {
							missingCharacterIds.push(character.character.mal_id);
						}
					}
				}

				if (missingCharacterIds.length > 0) {
					try {
						const childProgressName = this.createChildProgress(
							`Characters (${missingCharacterIds.length})`,
							missingCharacterIds.length,
						);
						const charactersFetcher = new CharactersFetcher(childProgressName);
						await charactersFetcher.upsertFromList(missingCharacterIds);
						this.removeChildProgress(childProgressName);
					} catch (error) {
						console.warn("Failed to fetch missing characters:", error);
					}
				}

				const missingPeopleIds: number[] = [];
				for (const character of charactersData.data) {
					if (character.voice_actors) {
						for (const voiceActor of character.voice_actors) {
							if (voiceActor.person?.mal_id) {
								const existingPerson = await PeopleRepository.findById(
									voiceActor.person.mal_id,
								);
								if (!existingPerson) {
									missingPeopleIds.push(voiceActor.person.mal_id);
								}
							}
						}
					}
				}

				if (missingPeopleIds.length > 0) {
					try {
						const childProgressName = this.createChildProgress(
							`Voice Actors (${missingPeopleIds.length})`,
							missingPeopleIds.length,
						);
						const peopleFetcher = new PeopleFetcher(childProgressName);
						await peopleFetcher.upsertFromList(missingPeopleIds);
						this.removeChildProgress(childProgressName);
					} catch (error) {
						console.warn(
							"Failed to fetch missing people for voice actors:",
							error,
						);
					}
				}

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
						await AnimeToCharacterRepository.upsertMany(characterRelations);
					result.inserted += characterResult.length ?? 0;

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
							await CharacterToPeopleRepository.upsertMany(
								characterToPeopleRelations,
							);
						result.inserted += characterToPeopleResult.length ?? 0;
					}
				}
			}

			const staffData = await this.fetchJson<JikanResponse<AnimeStaffData[]>>(
				`${this.baseUrl}/anime/${animeId}/staff`,
			);

			if (staffData?.data) {
				const missingStaffIds: number[] = [];
				for (const staff of staffData.data) {
					if (staff.person?.mal_id) {
						const existingPerson = await PeopleRepository.findById(
							staff.person.mal_id,
						);
						if (!existingPerson) {
							missingStaffIds.push(staff.person.mal_id);
						}
					}
				}

				if (missingStaffIds.length > 0) {
					try {
						const childProgressName = this.createChildProgress(
							`Staff (${missingStaffIds.length})`,
							missingStaffIds.length,
						);
						const peopleFetcher = new PeopleFetcher(childProgressName);
						await peopleFetcher.upsertFromList(missingStaffIds);
						this.removeChildProgress(childProgressName);
					} catch (error) {
						console.warn("Failed to fetch missing people for staff:", error);
					}
				}

				const staffRelations = staffData.data
					.map((staff) => AnimeMapper.mapStaffRelation(animeId, staff))
					.filter(
						(relation): relation is NonNullable<typeof relation> =>
							relation !== null,
					);

				if (staffRelations.length > 0) {
					const staffResult =
						await AnimeToPeopleRepository.upsertMany(staffRelations);
					result.inserted += staffResult.length ?? 0;
				}
			}

			return result;
		} catch (error) {
			console.log(error);

			console.error(
				`❌ DATABASE_ERROR: Failed to process characters and staff for anime ${animeId}`,
				{
					entityType: "anime-characters-staff",
					entityId: animeId,
					error: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
				},
			);
			return { inserted: 0, updated: 0, skipped: 0, errors: 1, ids: [] };
		}
	}
}
