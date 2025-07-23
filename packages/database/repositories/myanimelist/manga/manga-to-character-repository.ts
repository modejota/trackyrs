import { database, mangaToCharacterTable } from "@/index";
import type { NewMangaToCharacter } from "@/schemas/myanimelist/manga/manga-to-character-schema";

export default class MangaToCharacterRepository {
	static async insertMany(relations: NewMangaToCharacter[]) {
		if (relations.length === 0) return { rowCount: 0 };

		return await database
			.insert(mangaToCharacterTable)
			.values(relations)
			.onConflictDoNothing();
	}

	static async insert(relation: NewMangaToCharacter) {
		return await database
			.insert(mangaToCharacterTable)
			.values(relation)
			.onConflictDoNothing();
	}
}
