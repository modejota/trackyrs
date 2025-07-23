import { and, eq } from "drizzle-orm";
import { database } from "@/index";
import {
	type AnimeProducerRole,
	type AnimeToProducers,
	animeToProducersTable,
	type NewAnimeToProducers,
} from "@/schemas/myanimelist/anime/anime-to-producers-schema";

export default class AnimeToProducersRepository {
	static async findByAnimeId(animeId: number): Promise<AnimeToProducers[]> {
		return await database
			.select()
			.from(animeToProducersTable)
			.where(eq(animeToProducersTable.animeId, animeId));
	}
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
	static async deleteByAnimeId(animeId: number): Promise<void> {
		await database
			.delete(animeToProducersTable)
			.where(eq(animeToProducersTable.animeId, animeId));
	}

	static async deleteByAnimeIdAndRole(
		animeId: number,
		role: AnimeProducerRole,
	): Promise<void> {
		await database
			.delete(animeToProducersTable)
			.where(
				and(
					eq(animeToProducersTable.animeId, animeId),
					eq(animeToProducersTable.role, role),
				),
			);
	}

	private static async findExisting(
		data: NewAnimeToProducers,
	): Promise<AnimeToProducers | null> {
		const result = await database
			.select()
			.from(animeToProducersTable)
			.where(
				and(
					eq(animeToProducersTable.animeId, data.animeId),
					eq(animeToProducersTable.producerId, data.producerId),
					eq(animeToProducersTable.role, data.role),
				),
			)
			.limit(1);

		return result[0] || null;
	}
}
