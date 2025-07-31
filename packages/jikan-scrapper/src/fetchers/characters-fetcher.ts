import CharacterRepository from "@trackyrs/database/repositories/myanimelist/character/character-repository";
import type { NewCharacter } from "@trackyrs/database/schemas/myanimelist/character/character-schema";
import { BaseFetcher } from "@/base-fetcher";
import { CharacterMapper } from "@/mappers/character-mapper";
import type {
	CharacterData,
	DatabaseOperationResult,
	JikanResponse,
} from "@/types";

export class CharactersFetcher extends BaseFetcher {
	async upsertAll(): Promise<DatabaseOperationResult> {
		return this.upsertRange(1);
	}

	async upsertSingle(id: number): Promise<DatabaseOperationResult> {
		try {
			return await this.processCharacterId(id);
		} catch (error) {
			this.stopProgress();
			console.error(`❌ Failed to upsert single character ${id}`, {
				entityType: "character",
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
			return await this.fetchPaginatedData<CharacterData>(
				`${this.baseUrl}/characters`,
				(data) => this.processCharacterPageRange(data, startId),
				startPage,
				false,
			);
		} catch (error) {
			console.error(
				`❌ Failed to upsert characters range starting from ${startId}`,
				{
					entityType: "character",
					startId,
					error: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
				},
			);
			return { inserted: 0, updated: 0, skipped: 0, errors: 1, ids: [] };
		}
	}

	private async processCharacterId(
		id: number,
	): Promise<DatabaseOperationResult> {
		try {
			const data = await this.fetchJson<JikanResponse<CharacterData>>(
				`${this.baseUrl}/characters/${id}`,
			);

			if (!data || !data.data) {
				return { inserted: 0, updated: 0, skipped: 1, errors: 0, ids: [] };
			}

			return await this.upsertCharacter(data.data);
		} catch (error) {
			console.error(`❌ Error processing character ID ${id}`, {
				entityType: "character",
				entityId: id,
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

	private async processCharacterPageRange(
		data: JikanResponse<CharacterData[]>,
		startId: number,
	): Promise<DatabaseOperationResult> {
		return this.processCharacterPageFiltered(
			data,
			(mal_id) => mal_id >= startId,
		);
	}

	private async processCharacterPageFiltered(
		data: JikanResponse<CharacterData[]>,
		filter: (mal_id: number) => boolean,
	): Promise<DatabaseOperationResult> {
		const result: DatabaseOperationResult = {
			inserted: 0,
			updated: 0,
			skipped: 0,
			errors: 0,
			ids: [],
		};
		for (const characterData of data.data) {
			if (filter(characterData.mal_id)) {
				try {
					const itemResult = await this.upsertCharacter(characterData);
					result.inserted += itemResult.inserted;
					result.updated += itemResult.updated;
					result.skipped += itemResult.skipped;
					result.errors += itemResult.errors;
					result.ids.push(...itemResult.ids);
				} catch (error) {
					result.errors++;
					console.error(`Error processing character ${characterData.mal_id}:`, {
						id: characterData.mal_id,
						error: error instanceof Error ? error.message : String(error),
						stack: error instanceof Error ? error.stack : undefined,
					});
				}
			}
		}
		return result;
	}

	private async upsertCharacter(
		characterData: CharacterData,
	): Promise<DatabaseOperationResult> {
		try {
			const mappedData: NewCharacter =
				CharacterMapper.mapCharacterData(characterData);

			const existingCharacter = await CharacterRepository.findById(
				characterData.mal_id,
			);

			const upsertedCharacter = await CharacterRepository.upsert(mappedData);

			if (existingCharacter) {
				return {
					inserted: 0,
					updated: 1,
					skipped: 0,
					errors: 0,
					ids: [upsertedCharacter.id],
				};
			}
			return {
				inserted: 1,
				updated: 0,
				skipped: 0,
				errors: 0,
				ids: [upsertedCharacter.id],
			};
		} catch (error) {
			console.error(
				`❌ DATABASE_ERROR: Failed to upsert character ${characterData.mal_id}`,
				{
					entityType: "character",
					entityId: characterData.mal_id,
					error: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
				},
			);
			return { inserted: 0, updated: 0, skipped: 0, errors: 1, ids: [] };
		}
	}
}
