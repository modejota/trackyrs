import { sql } from "drizzle-orm";
import { database, mangaToCharacterTable } from "@/index";
import type {
	MangaToCharacter,
	NewMangaToCharacter,
} from "@/schemas/myanimelist/manga/manga-to-character-schema";

export default class MangaToCharacterRepository {
	static async insert(relation: NewMangaToCharacter) {
		return await database
			.insert(mangaToCharacterTable)
			.values(relation)
			.onConflictDoNothing();
	}

	static async insertMany(relations: NewMangaToCharacter[]) {
		if (relations.length === 0) return { rowCount: 0 };

		return await database
			.insert(mangaToCharacterTable)
			.values(relations)
			.onConflictDoNothing();
	}

	static async upsert(
		relation: NewMangaToCharacter,
	): Promise<MangaToCharacter> {
		const result = await database
			.insert(mangaToCharacterTable)
			.values(relation)
			.onConflictDoUpdate({
				target: [
					mangaToCharacterTable.mangaId,
					mangaToCharacterTable.characterId,
				],
				set: relation,
			})
			.returning();
		return result[0] as MangaToCharacter;
	}

	static async upsertMany(
		relations: NewMangaToCharacter[],
	): Promise<MangaToCharacter[]> {
		if (relations.length === 0) return [];

		const result = await database
			.insert(mangaToCharacterTable)
			.values(relations)
			.onConflictDoUpdate({
				target: [
					mangaToCharacterTable.mangaId,
					mangaToCharacterTable.characterId,
					mangaToCharacterTable.role,
				],
				set: {
					mangaId: sql`excluded.manga_id`,
					characterId: sql`excluded.character_id`,
					role: sql`excluded.role`,
				},
			})
			.returning();
		return result as MangaToCharacter[];
	}
}
