import { animeToCharacterTable, database } from "@/index";
import type { NewAnimeToCharacter } from "@/schemas/myanimelist/anime/anime-to-character-schema";

export default class AnimeToCharacterRepository {
	static async insertMany(relations: NewAnimeToCharacter[]) {
		if (relations.length === 0) return { rowCount: 0 };

		return await database
			.insert(animeToCharacterTable)
			.values(relations)
			.onConflictDoNothing();
	}

	static async insert(relation: NewAnimeToCharacter) {
		return await database
			.insert(animeToCharacterTable)
			.values(relation)
			.onConflictDoNothing();
	}
}
