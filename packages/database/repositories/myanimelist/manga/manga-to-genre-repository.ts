import { sql } from "drizzle-orm";
import { database, mangaToGenreTable } from "@/index";
import type {
	MangaToGenre,
	NewMangaToGenre,
} from "@/schemas/myanimelist/manga/manga-to-genre-schema";

export default class MangaToGenreRepository {
	static async insert(relation: NewMangaToGenre) {
		return await database
			.insert(mangaToGenreTable)
			.values(relation)
			.onConflictDoNothing();
	}

	static async insertMany(relations: NewMangaToGenre[]) {
		if (relations.length === 0) return;
		return await database
			.insert(mangaToGenreTable)
			.values(relations)
			.onConflictDoNothing();
	}

	static async upsert(relation: NewMangaToGenre): Promise<MangaToGenre> {
		const result = await database
			.insert(mangaToGenreTable)
			.values(relation)
			.onConflictDoUpdate({
				target: [
					mangaToGenreTable.mangaId,
					mangaToGenreTable.genreId,
					mangaToGenreTable.role,
				],
				set: relation,
			})
			.returning();
		return result[0] as MangaToGenre;
	}

	static async upsertMany(
		relations: NewMangaToGenre[],
	): Promise<MangaToGenre[]> {
		if (relations.length === 0) return [];
		const result = await database
			.insert(mangaToGenreTable)
			.values(relations)
			.onConflictDoUpdate({
				target: [
					mangaToGenreTable.mangaId,
					mangaToGenreTable.genreId,
					mangaToGenreTable.role,
				],
				set: {
					mangaId: sql`excluded.manga_id`,
					genreId: sql`excluded.genre_id`,
					role: sql`excluded.role`,
				},
			})
			.returning();
		return result as MangaToGenre[];
	}
}
