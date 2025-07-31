import MangaGenreRepository from "@trackyrs/database/repositories/myanimelist/manga/manga-genre-repository";
import MangaMagazineRepository from "@trackyrs/database/repositories/myanimelist/manga/manga-magazine-repository";
import MangaRepository from "@trackyrs/database/repositories/myanimelist/manga/manga-repository";
import MangaToGenreRepository from "@trackyrs/database/repositories/myanimelist/manga/manga-to-genre-repository";
import MangaToMagazineRepository from "@trackyrs/database/repositories/myanimelist/manga/manga-to-magazine-repository";
import MangaToPeopleRepository from "@trackyrs/database/repositories/myanimelist/manga/manga-to-people-repository";
import PeopleRepository from "@trackyrs/database/repositories/myanimelist/people-repository";
import type { NewManga } from "@trackyrs/database/schemas/myanimelist/manga/manga-schema";
import type { NewMangaToPeople } from "@trackyrs/database/schemas/myanimelist/manga/manga-to-people-schema";
import { BaseFetcher } from "@/base-fetcher";
import { MagazinesFetcher } from "@/fetchers/magazines-fetcher";
import { PeopleFetcher } from "@/fetchers/people-fetcher";
import { MangaMapper } from "@/mappers/manga-mapper";
import type {
	DatabaseOperationResult,
	JikanResponse,
	MangaData,
} from "@/types";

export class MangaFetcher extends BaseFetcher {
	async upsertAll(): Promise<DatabaseOperationResult> {
		return this.upsertRange(1);
	}

	async upsertSingle(id: number): Promise<DatabaseOperationResult> {
		try {
			return await this.processMangaId(id);
		} catch (error) {
			this.stopProgress();
			console.error(`❌ Failed to upsert single manga ${id}`, {
				entityType: "manga",
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
			return await this.fetchPaginatedData<MangaData>(
				`${this.baseUrl}/manga`,
				(data) => this.processMangaPageRange(data, startId),
				startPage,
				false,
			);
		} catch (error) {
			console.error(
				`❌ Failed to upsert manga range starting from ${startId}`,
				{
					entityType: "manga",
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
					console.error(`Error processing manga ID ${id}:`, {
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

	private async processMangaId(id: number): Promise<DatabaseOperationResult> {
		try {
			const data = await this.fetchJson<JikanResponse<MangaData>>(
				`${this.baseUrl}/manga/${id}`,
			);

			if (!data || !data.data) {
				return { inserted: 0, updated: 0, skipped: 1, errors: 0, ids: [] };
			}

			return await this.upsertManga(data.data);
		} catch (error) {
			console.error(`❌ FETCH ERROR: Failed to fetch data for manga ${id}`, {
				entityType: "manga",
				entityId: id,
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
			});
			return { inserted: 0, updated: 0, skipped: 0, errors: 1, ids: [] };
		}
	}

	private async upsertManga(
		mangaData: MangaData,
	): Promise<DatabaseOperationResult> {
		try {
			const genreIds = await MangaGenreRepository.findAllIds();
			const genreMap = new Map(genreIds.map((id) => [id, id]));

			const mappedData: NewManga = MangaMapper.mapMangaData(mangaData);
			const existingManga = await MangaRepository.findById(mangaData.mal_id);

			const upsertedManga = await MangaRepository.upsert(mappedData);

			let result: DatabaseOperationResult;
			if (existingManga) {
				result = {
					inserted: 0,
					updated: 1,
					skipped: 0,
					errors: 0,
					ids: [upsertedManga.id],
				};
			} else {
				result = {
					inserted: 1,
					updated: 0,
					skipped: 0,
					errors: 0,
					ids: [upsertedManga.id],
				};
			}

			const genreRelations = MangaMapper.mapGenreRelations(
				mangaData.mal_id,
				mangaData,
				genreMap,
			);

			if (genreRelations.length > 0) {
				await MangaToGenreRepository.upsertMany(genreRelations);
			}

			const magazineRelations = MangaMapper.mapMagazineRelations(
				mangaData.mal_id,
				mangaData,
			);
			const uniqueMagazineRelations = Array.from(
				new Map(
					magazineRelations.map((r) => [`${r.mangaId}-${r.magazineId}`, r]),
				).values(),
			);

			if (magazineRelations.length > 0) {
				await this.resolveMagazineDependencies(uniqueMagazineRelations);
				await MangaToMagazineRepository.upsertMany(uniqueMagazineRelations);
			}

			const peopleRelations = MangaMapper.mapPeopleRelations(
				mangaData.mal_id,
				mangaData,
			);
			const uniquePeopleRelations = Array.from(
				new Map(
					peopleRelations.map((r) => [`${r.mangaId}-${r.peopleId}`, r]),
				).values(),
			);

			if (peopleRelations.length > 0) {
				await this.resolvePeopleDependencies(uniquePeopleRelations);
				await MangaToPeopleRepository.upsertMany(uniquePeopleRelations);
			}

			return result;
		} catch (error) {
			console.error(
				`❌ DATABASE_ERROR: Failed to upsert manga ${mangaData.mal_id}`,
				{
					entityType: "manga",
					entityId: mangaData.mal_id,
					error: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
				},
			);
			return { inserted: 0, updated: 0, skipped: 0, errors: 1, ids: [] };
		}
	}

	private async processMangaPageFiltered(
		data: JikanResponse<MangaData[]>,
		filter: (mal_id: number) => boolean,
	): Promise<DatabaseOperationResult> {
		const result: DatabaseOperationResult = {
			inserted: 0,
			updated: 0,
			skipped: 0,
			errors: 0,
			ids: [],
		};
		for (const mangaData of data.data) {
			if (filter(mangaData.mal_id)) {
				try {
					const itemResult = await this.upsertManga(mangaData);
					result.inserted += itemResult.inserted;
					result.updated += itemResult.updated;
					result.skipped += itemResult.skipped;
					result.errors += itemResult.errors;
					result.ids.push(...itemResult.ids);
				} catch (error) {
					result.errors++;
					console.error(`Error processing manga ${mangaData.mal_id}:`, {
						id: mangaData.mal_id,
						error: error instanceof Error ? error.message : String(error),
						stack: error instanceof Error ? error.stack : undefined,
					});
				}
			}
		}
		return result;
	}

	private async processMangaPageRange(
		data: JikanResponse<MangaData[]>,
		startId: number,
	): Promise<DatabaseOperationResult> {
		return this.processMangaPageFiltered(data, (mal_id) => mal_id >= startId);
	}

	private async resolveMagazineDependencies(
		magazineRelations: { mangaId: number; magazineId: number }[],
	): Promise<void> {
		const magazineIds = magazineRelations.map((rel) => rel.magazineId);

		const missingMagazineIds: number[] = [];

		for (const magazineId of magazineIds) {
			const existingMagazine =
				await MangaMagazineRepository.findById(magazineId);
			if (!existingMagazine) {
				missingMagazineIds.push(magazineId);
			}
		}

		if (missingMagazineIds.length > 0) {
			const childProgressName = this.createChildProgress(
				`Magazines (${missingMagazineIds.length})`,
				missingMagazineIds.length,
			);
			const magazinesFetcher = new MagazinesFetcher(childProgressName);
			await magazinesFetcher.upsertFromList(missingMagazineIds);
			this.removeChildProgress(childProgressName);
		}
	}

	private async resolvePeopleDependencies(
		peopleRelations: NewMangaToPeople[],
	): Promise<void> {
		const peopleIds = peopleRelations.map((rel) => rel.peopleId);

		const missingPeopleIds: number[] = [];

		for (const peopleId of peopleIds) {
			const existingPerson = await PeopleRepository.findById(peopleId);
			if (!existingPerson) {
				missingPeopleIds.push(peopleId);
			}
		}

		if (missingPeopleIds.length > 0) {
			const childProgressName = this.createChildProgress(
				`People (${missingPeopleIds.length})`,
				missingPeopleIds.length,
			);
			const peopleFetcher = new PeopleFetcher(childProgressName);
			await peopleFetcher.upsertFromList(missingPeopleIds);
			this.removeChildProgress(childProgressName);
		}
	}
}
