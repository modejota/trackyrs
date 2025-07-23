import { eq } from "drizzle-orm";
import { database, mangaGenreTable } from "@/index";
import type { NewMangaGenre } from "@/schemas/myanimelist/manga/manga-genre-schema";

export default class MangaGenreRepository {
	static async findById(id: number) {
		const result = await database
			.select()
			.from(mangaGenreTable)
			.where(eq(mangaGenreTable.id, id))
			.limit(1);
		return result[0];
	}

	static async findByMalId(malId: number) {
		const result = await database
			.select()
			.from(mangaGenreTable)
			.where(eq(mangaGenreTable.id, malId))
			.limit(1);
		return result[0];
	}

	static async findAllIds(): Promise<number[]> {
		const result = await database
			.select({ id: mangaGenreTable.id })
			.from(mangaGenreTable);
		return result.map((row) => row.id);
	}

	static async insert(genre: NewMangaGenre) {
		return await database
			.insert(mangaGenreTable)
			.values(genre)
			.onConflictDoNothing();
	}
}
