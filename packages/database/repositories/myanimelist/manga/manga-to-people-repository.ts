import { eq } from "drizzle-orm";
import { database, mangaToPeopleTable } from "@/index";
import type { NewMangaToPeople } from "@/schemas/myanimelist/manga/manga-to-people-schema";

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
}
