import { eq } from "drizzle-orm";
import { database, mangaMagazineTable } from "@/index";
import type {
	Magazine,
	NewMagazine,
} from "@/schemas/myanimelist/manga/manga-magazine-schema";

export default class MangaMagazineRepository {
	static async findById(id: number) {
		const result = await database
			.select()
			.from(mangaMagazineTable)
			.where(eq(mangaMagazineTable.id, id))
			.limit(1);
		return result[0];
	}

	static async insert(magazine: NewMagazine) {
		return await database
			.insert(mangaMagazineTable)
			.values(magazine)
			.onConflictDoNothing({ target: mangaMagazineTable.id });
	}

	static async update(id: number, magazine: NewMagazine) {
		return await database
			.update(mangaMagazineTable)
			.set(magazine)
			.where(eq(mangaMagazineTable.id, id));
	}

	static async upsert(magazine: NewMagazine): Promise<Magazine> {
		const result = await database
			.insert(mangaMagazineTable)
			.values(magazine)
			.onConflictDoUpdate({
				target: mangaMagazineTable.id,
				set: magazine,
			})
			.returning();
		return result[0] as Magazine;
	}
}
