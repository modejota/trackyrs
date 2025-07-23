import { database, mangaToGenreTable } from "@/index";
import type { NewMangaToGenre } from "@/schemas/myanimelist/manga/manga-to-genre-schema";

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
}
