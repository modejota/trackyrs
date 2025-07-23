import { and, eq, gte, lte } from "drizzle-orm";

import { animeTable, database } from "@/index";
import type { NewAnime } from "@/schemas/myanimelist/anime/anime-schema";

export default class AnimeRepository {
	static async findById(id: number) {
		const result = await database
			.select()
			.from(animeTable)
			.where(eq(animeTable.id, id))
			.limit(1);
		return result[0];
	}

	static async insert(anime: NewAnime) {
		return await database
			.insert(animeTable)
			.values(anime)
			.onConflictDoNothing();
	}

	static async update(id: number, anime: NewAnime) {
		return await database
			.update(animeTable)
			.set(anime)
			.where(eq(animeTable.id, id));
	}

	static async findIdsFromRange(startId?: number): Promise<number[]> {
		const query = database.select({ id: animeTable.id }).from(animeTable);

		if (startId) {
			query.where(gte(animeTable.id, startId));
		}

		const result = await query.orderBy(animeTable.id);
		return result.map((row) => row.id);
	}

	static async findIdsBetween(
		startId: number,
		endId: number,
	): Promise<number[]> {
		const result = await database
			.select({ id: animeTable.id })
			.from(animeTable)
			.where(and(gte(animeTable.id, startId), lte(animeTable.id, endId)))
			.orderBy(animeTable.id);

		return result.map((row) => row.id);
	}

	static async findAllIds(): Promise<number[]> {
		const result = await database
			.select({ id: animeTable.id })
			.from(animeTable)
			.orderBy(animeTable.id);

		return result.map((row) => row.id);
	}

	static async findIdsFromRangeGreaterThanOrEqual(
		startId: number,
	): Promise<number[]> {
		const result = await database
			.select({ id: animeTable.id })
			.from(animeTable)
			.where(gte(animeTable.id, startId))
			.orderBy(animeTable.id);

		return result.map((row) => row.id);
	}
}
