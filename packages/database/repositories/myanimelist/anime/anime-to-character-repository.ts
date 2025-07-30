import { sql } from "drizzle-orm";
import { animeToCharacterTable, database } from "@/index";
import type {
	AnimeToCharacter,
	NewAnimeToCharacter,
} from "@/schemas/myanimelist/anime/anime-to-character-schema";

export default class AnimeToCharacterRepository {
	static async insert(relation: NewAnimeToCharacter) {
		return await database
			.insert(animeToCharacterTable)
			.values(relation)
			.onConflictDoNothing();
	}

	static async insertMany(relations: NewAnimeToCharacter[]) {
		if (relations.length === 0) return { rowCount: 0 };

		return await database
			.insert(animeToCharacterTable)
			.values(relations)
			.onConflictDoNothing();
	}

	static async upsert(
		relation: NewAnimeToCharacter,
	): Promise<AnimeToCharacter> {
		const result = await database
			.insert(animeToCharacterTable)
			.values(relation)
			.onConflictDoUpdate({
				target: [
					animeToCharacterTable.animeId,
					animeToCharacterTable.characterId,
					animeToCharacterTable.role,
				],
				set: relation,
			})
			.returning();
		return result[0] as AnimeToCharacter;
	}

	static async upsertMany(
		relations: NewAnimeToCharacter[],
	): Promise<AnimeToCharacter[]> {
		if (relations.length === 0) return [];

		const result = await database
			.insert(animeToCharacterTable)
			.values(relations)
			.onConflictDoUpdate({
				target: [
					animeToCharacterTable.animeId,
					animeToCharacterTable.characterId,
					animeToCharacterTable.role,
				],
				set: {
					animeId: sql`excluded.anime_id`,
					characterId: sql`excluded.character_id`,
					role: sql`excluded.role`,
				},
			})
			.returning();
		return result as AnimeToCharacter[];
	}
}
