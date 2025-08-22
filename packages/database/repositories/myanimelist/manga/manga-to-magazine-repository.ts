import { eq, sql } from "drizzle-orm";
import { database, mangaToMagazineTable } from "../../../index";
import type {
	MangaToMagazine,
	NewMangaToMagazine,
} from "../../../schemas/myanimelist/manga/manga-to-magazine-schema";

export default class MangaToMagazineRepository {
	static async findByMangaId(mangaId: number) {
		return await database
			.select()
			.from(mangaToMagazineTable)
			.where(eq(mangaToMagazineTable.mangaId, mangaId));
	}

	static async insert(relation: NewMangaToMagazine) {
		return await database
			.insert(mangaToMagazineTable)
			.values(relation)
			.onConflictDoNothing();
	}

	static async insertMany(relations: NewMangaToMagazine[]) {
		if (relations.length === 0) return;
		return await database
			.insert(mangaToMagazineTable)
			.values(relations)
			.onConflictDoNothing();
	}

	static async upsert(relation: NewMangaToMagazine): Promise<MangaToMagazine> {
		const result = await database
			.insert(mangaToMagazineTable)
			.values(relation)
			.onConflictDoUpdate({
				target: [mangaToMagazineTable.mangaId, mangaToMagazineTable.magazineId],
				set: relation,
			})
			.returning();
		return result[0] as MangaToMagazine;
	}

	static async upsertMany(
		relations: NewMangaToMagazine[],
	): Promise<MangaToMagazine[]> {
		if (relations.length === 0) return [];
		const result = await database
			.insert(mangaToMagazineTable)
			.values(relations)
			.onConflictDoUpdate({
				target: [mangaToMagazineTable.mangaId, mangaToMagazineTable.magazineId],
				set: {
					mangaId: sql`excluded.manga_id`,
					magazineId: sql`excluded.magazine_id`,
				},
			})
			.returning();
		return result as MangaToMagazine[];
	}
}
