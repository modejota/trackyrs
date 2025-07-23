import MangaRepository from "@trackyrs/database/repositories/myanimelist/manga/manga-repository";
import MangaToCharacterRepository from "@trackyrs/database/repositories/myanimelist/manga/manga-to-character-repository";
import { BaseFetcher } from "@/base-fetcher";
import { FetcherError, FetcherErrorType } from "@/fetcher-error";
import { MangaMapper } from "@/mappers/manga-mapper";
import type {
	DatabaseOperationResult,
	JikanResponse,
	MangaCharacterData,
} from "@/types";

export class MangaCharactersFetcher extends BaseFetcher {
	async insertAll(): Promise<DatabaseOperationResult> {
		return this.insertRange(1);
	}

	async insertSingle(id: number): Promise<DatabaseOperationResult> {
		try {
			return await this.processMangaCharacters(id);
		} catch (error) {
			if (error instanceof FetcherError) {
				throw error;
			}
			throw new FetcherError(
				FetcherErrorType.UNKNOWN_ERROR,
				`Failed to insert characters for manga ${id}`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	}

	async insertRange(startId?: number): Promise<DatabaseOperationResult> {
		try {
			const mangaIds = startId
				? await MangaRepository.findIdsFromRangeGreaterThanOrEqual(startId)
				: await MangaRepository.findAllIds();

			return await this.processMangaList(mangaIds);
		} catch (error) {
			if (error instanceof FetcherError) {
				throw error;
			}
			throw new FetcherError(
				FetcherErrorType.UNKNOWN_ERROR,
				`Failed to insert characters for manga range starting from ${startId}`,
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
			const mangaIds = await MangaRepository.findIdsBetween(startId, endId);
			return await this.processMangaList(mangaIds);
		} catch (error) {
			if (error instanceof FetcherError) {
				throw error;
			}
			throw new FetcherError(
				FetcherErrorType.UNKNOWN_ERROR,
				`Failed to insert characters for manga between ${startId} and ${endId}`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	}

	async insertFromList(ids: number[]): Promise<DatabaseOperationResult> {
		return this.processMangaList(ids);
	}

	async updateFromList(ids: number[]): Promise<DatabaseOperationResult> {
		return this.processMangaList(ids);
	}

	private async processMangaList(
		mangaIds: number[],
	): Promise<DatabaseOperationResult> {
		if (mangaIds.length === 0)
			return { inserted: 0, updated: 0, skipped: 0, errors: 0 };

		this.resetProgress();
		this.operationProgress.total = mangaIds.length;
		this.progressBar.start(mangaIds.length, 0);

		const totalResult: DatabaseOperationResult = {
			inserted: 0,
			updated: 0,
			skipped: 0,
			errors: 0,
		};

		try {
			for (const mangaId of mangaIds) {
				try {
					const result = await this.processMangaCharacters(mangaId);
					totalResult.inserted += result.inserted;
					totalResult.updated += result.updated;
					totalResult.skipped += result.skipped;
					totalResult.errors += result.errors;
				} catch (error) {
					totalResult.errors++;
					console.warn(`Error processing manga ${mangaId}:`, error);
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

	private async processMangaCharacters(
		mangaId: number,
	): Promise<DatabaseOperationResult> {
		const result: DatabaseOperationResult = {
			inserted: 0,
			updated: 0,
			skipped: 0,
			errors: 0,
		};

		try {
			const charactersData = await this.fetchJson<
				JikanResponse<MangaCharacterData[]>
			>(`${this.baseUrl}/manga/${mangaId}/characters`);

			if (charactersData?.data) {
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
						await MangaToCharacterRepository.insertMany(characterRelations);
					result.inserted += characterResult.rowCount ?? 0;
				}
			}

			return result;
		} catch (error) {
			if (error instanceof FetcherError) {
				throw error;
			}
			throw new FetcherError(
				FetcherErrorType.DATABASE_ERROR,
				`Failed to process characters for manga ${mangaId}`,
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	}
}
