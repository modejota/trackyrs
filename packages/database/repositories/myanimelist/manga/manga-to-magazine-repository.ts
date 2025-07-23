import { eq } from "drizzle-orm";
import { database, mangaToMagazineTable } from "@/index";
import type { NewMangaToMagazine } from "@/schemas/myanimelist/manga/manga-to-magazine-schema";

export default class MangaToMagazineRepository {
	static async findByMangaId(mangaId: number) {
		return await database
			.select()
			.from(mangaToMagazineTable)
			.where(eq(mangaToMagazineTable.mangaId, mangaId));
	}

	static async insert(relation: NewMangaToMagazine) {
		return await database
			.insert(mangaToMagazineTable)
			.values(relation)
			.onConflictDoNothing();
	}

	static async insertMany(relations: NewMangaToMagazine[]) {
		if (relations.length === 0) return;
		return await database
			.insert(mangaToMagazineTable)
			.values(relations)
			.onConflictDoNothing();
	}
}
