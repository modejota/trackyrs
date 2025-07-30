import { and, eq, gte, lte } from "drizzle-orm";
import { database, mangaTable } from "@/index";
import type { Manga, NewManga } from "@/schemas";

export default class MangaRepository {
	static async findById(id: number) {
		const result = await database
			.select()
			.from(mangaTable)
			.where(eq(mangaTable.id, id))
			.limit(1);
		return result[0];
	}

	static async insert(manga: NewManga) {
		return await database
			.insert(mangaTable)
			.values(manga)
			.onConflictDoNothing({ target: mangaTable.id });
	}

	static async update(id: number, manga: NewManga) {
		return await database
			.update(mangaTable)
			.set(manga)
			.where(eq(mangaTable.id, id));
	}

	static async upsert(manga: NewManga): Promise<Manga> {
		const result = await database
			.insert(mangaTable)
			.values(manga)
			.onConflictDoUpdate({
				target: mangaTable.id,
				set: manga,
			})
			.returning();
		return result[0] as Manga;
	}

	static async findIdsFromRangeGreaterThanOrEqual(
		startId: number,
	): Promise<number[]> {
		const result = await database
			.select({ id: mangaTable.id })
			.from(mangaTable)
			.where(gte(mangaTable.id, startId))
			.orderBy(mangaTable.id);

		return result.map((row) => row.id);
	}
}
