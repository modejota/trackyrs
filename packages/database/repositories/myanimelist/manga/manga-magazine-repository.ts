import { eq } from "drizzle-orm";
import { database, mangaMagazineTable } from "@/index";
import type { NewMagazine } from "@/schemas/myanimelist/manga/manga-magazine-schema";

export default class MangaMagazineRepository {
	static async findById(id: number) {
		const result = await database
			.select()
			.from(mangaMagazineTable)
			.where(eq(mangaMagazineTable.id, id))
			.limit(1);
		return result[0];
	}

	static async findAllIds(): Promise<number[]> {
		const result = await database
			.select({ id: mangaMagazineTable.id })
			.from(mangaMagazineTable);
		return result.map((row) => row.id);
	}

	static async insert(magazine: NewMagazine) {
		return await database
			.insert(mangaMagazineTable)
			.values(magazine)
			.onConflictDoNothing();
	}

	static async update(id: number, magazine: NewMagazine) {
		return await database
			.update(mangaMagazineTable)
			.set(magazine)
			.where(eq(mangaMagazineTable.id, id));
	}
}
