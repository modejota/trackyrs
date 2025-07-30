import { and, eq, sql } from "drizzle-orm";
import { database } from "@/index";
import {
	type AnimeProducerRole,
	type AnimeToProducers,
	animeToProducersTable,
	type NewAnimeToProducers,
} from "@/schemas/myanimelist/anime/anime-to-producers-schema";

export default class AnimeToProducersRepository {
	static async insert(data: NewAnimeToProducers) {
		return await database
			.insert(animeToProducersTable)
			.values(data)
			.onConflictDoNothing()
			.returning();
	}

	static async insertMany(
		data: NewAnimeToProducers[],
	): Promise<AnimeToProducers[]> {
		if (data.length === 0) return [];

		return await database
			.insert(animeToProducersTable)
			.values(data)
			.onConflictDoNothing()
			.returning();
	}

	static async upsert(data: NewAnimeToProducers): Promise<AnimeToProducers> {
		const result = await database
			.insert(animeToProducersTable)
			.values(data)
			.onConflictDoUpdate({
				target: [
					animeToProducersTable.animeId,
					animeToProducersTable.producerId,
					animeToProducersTable.role,
				],
				set: data,
			})
			.returning();
		return result[0] as AnimeToProducers;
	}

	static async upsertMany(
		data: NewAnimeToProducers[],
	): Promise<AnimeToProducers[]> {
		if (data.length === 0) return [];

		const result = await database
			.insert(animeToProducersTable)
			.values(data)
			.onConflictDoUpdate({
				target: [
					animeToProducersTable.animeId,
					animeToProducersTable.producerId,
					animeToProducersTable.role,
				],
				set: {
					animeId: sql`excluded.anime_id`,
					producerId: sql`excluded.producer_id`,
					role: sql`excluded.role`,
				},
			})
			.returning();
		return result as AnimeToProducers[];
	}
}
