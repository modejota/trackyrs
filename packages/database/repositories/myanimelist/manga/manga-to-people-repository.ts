import { eq, sql } from "drizzle-orm";
import { database, mangaToPeopleTable } from "../../../index";
import type {
	MangaToPeople,
	NewMangaToPeople,
} from "../../../schemas/myanimelist/manga/manga-to-people-schema";

export default class MangaToPeopleRepository {
	static async findByMangaId(mangaId: number) {
		return await database
			.select()
			.from(mangaToPeopleTable)
			.where(eq(mangaToPeopleTable.mangaId, mangaId));
	}

	static async insert(relation: NewMangaToPeople) {
		return await database
			.insert(mangaToPeopleTable)
			.values(relation)
			.onConflictDoNothing();
	}

	static async insertMany(relations: NewMangaToPeople[]) {
		if (relations.length === 0) return;
		return await database
			.insert(mangaToPeopleTable)
			.values(relations)
			.onConflictDoNothing();
	}

	static async upsert(relation: NewMangaToPeople): Promise<MangaToPeople> {
		const result = await database
			.insert(mangaToPeopleTable)
			.values(relation)
			.onConflictDoUpdate({
				target: [mangaToPeopleTable.mangaId, mangaToPeopleTable.peopleId],
				set: relation,
			})
			.returning();
		return result[0] as MangaToPeople;
	}

	static async upsertMany(
		relations: NewMangaToPeople[],
	): Promise<MangaToPeople[]> {
		if (relations.length === 0) return [];
		const result = await database
			.insert(mangaToPeopleTable)
			.values(relations)
			.onConflictDoUpdate({
				target: [mangaToPeopleTable.mangaId, mangaToPeopleTable.peopleId],
				set: {
					mangaId: sql`excluded.manga_id`,
					peopleId: sql`excluded.people_id`,
				},
			})
			.returning();
		return result as MangaToPeople[];
	}
}
