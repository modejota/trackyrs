import CharacterRepository from "@trackyrs/database/repositories/myanimelist/character/character-repository";
import MangaRepository from "@trackyrs/database/repositories/myanimelist/manga/manga-repository";
import MangaToCharacterRepository from "@trackyrs/database/repositories/myanimelist/manga/manga-to-character-repository";
import { BaseFetcher } from "@/base-fetcher";
import { CharactersFetcher } from "@/fetchers/characters-fetcher";
import { MangaMapper } from "@/mappers/manga-mapper";
import type {
	DatabaseOperationResult,
	JikanResponse,
	MangaCharacterData,
} from "@/types";

export class MangaCharactersFetcher extends BaseFetcher {
	async upsertAll(): Promise<DatabaseOperationResult> {
		return this.upsertRange(1);
	}

	async upsertSingle(id: number): Promise<DatabaseOperationResult> {
		try {
			return await this.processMangaCharacters(id);
		} catch (error) {
			this.stopProgress();
			console.error(`❌ Failed to upsert characters for manga ${id}`, {
				entityType: "manga-characters",
				entityId: id,
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
			});
			return { inserted: 0, updated: 0, skipped: 0, errors: 1, ids: [] };
		}
	}

	async upsertRange(startId = 1): Promise<DatabaseOperationResult> {
		try {
			const mangaIds =
				await MangaRepository.findIdsFromRangeGreaterThanOrEqual(startId);
			return this.upsertFromList(mangaIds);
		} catch (error) {
			this.stopProgress();
			console.error(
				`❌ Failed to upsert characters for manga range starting from ${startId}`,
				{
					entityType: "manga-characters",
					startId,
					error: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
				},
			);
			return { inserted: 0, updated: 0, skipped: 0, errors: 1, ids: [] };
		}
	}

	async upsertFromList(ids: number[]): Promise<DatabaseOperationResult> {
		return this.processMangaList(ids);
	}

	private async processMangaList(
		mangaIds: number[],
	): Promise<DatabaseOperationResult> {
		if (mangaIds.length === 0)
			return { inserted: 0, updated: 0, skipped: 0, errors: 0, ids: [] };

		this.resetProgress();
		this.startProgress(mangaIds.length);

		const totalResult: DatabaseOperationResult = {
			inserted: 0,
			updated: 0,
			skipped: 0,
			errors: 0,
			ids: [],
		};

		try {
			for (const mangaId of mangaIds) {
				try {
					const result = await this.processMangaCharacters(mangaId);
					totalResult.inserted += result.inserted;
					totalResult.updated += result.updated;
					totalResult.skipped += result.skipped;
					totalResult.errors += result.errors;
					totalResult.ids.push(...result.ids);
				} catch (error) {
					totalResult.errors++;
					console.error(`Error processing manga ID ${mangaId}:`, {
						id: mangaId,
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

	private async processMangaCharacters(
		mangaId: number,
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
				JikanResponse<MangaCharacterData[]>
			>(`${this.baseUrl}/manga/${mangaId}/characters`);

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

				const characterRelations = charactersData.data
					.map((character) =>
						MangaMapper.mapCharacterRelation(mangaId, character),
					)
					.filter(
						(relation): relation is NonNullable<typeof relation> =>
							relation !== null,
					);

				if (characterRelations.length > 0) {
					const characterResult =
						await MangaToCharacterRepository.upsertMany(characterRelations);
					result.inserted += characterResult.length ?? 0;
				}
			}

			return result;
		} catch (error) {
			console.error(
				`❌ DATABASE_ERROR: Failed to process characters for manga ${mangaId}`,
				{
					entityType: "manga-characters",
					entityId: mangaId,
					error: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
				},
			);
			return { inserted: 0, updated: 0, skipped: 0, errors: 1, ids: [] };
		}
	}
}
