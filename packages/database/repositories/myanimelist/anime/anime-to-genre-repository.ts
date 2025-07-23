import { and, eq } from "drizzle-orm";
import { database } from "@/index";
import {
	type AnimeToGenre,
	animeToGenreTable,
	type NewAnimeToGenre,
} from "@/schemas/myanimelist/anime/anime-to-genre-schema";

export default class AnimeToGenreRepository {
	static async findByAnimeId(animeId: number): Promise<AnimeToGenre[]> {
		return await database
			.select()
			.from(animeToGenreTable)
			.where(eq(animeToGenreTable.animeId, animeId));
	}
	static async insert(data: NewAnimeToGenre) {
		return await database
			.insert(animeToGenreTable)
			.values(data)
			.onConflictDoNothing()
			.returning();
	}

	static async insertMany(data: NewAnimeToGenre[]): Promise<AnimeToGenre[]> {
		if (data.length === 0) return [];

		return await database
			.insert(animeToGenreTable)
			.values(data)
			.onConflictDoNothing()
			.returning();
	}
	static async deleteByAnimeId(animeId: number): Promise<void> {
		await database
			.delete(animeToGenreTable)
			.where(eq(animeToGenreTable.animeId, animeId));
	}

	private static async findExisting(
		data: NewAnimeToGenre,
	): Promise<AnimeToGenre | null> {
		const result = await database
			.select()
			.from(animeToGenreTable)
			.where(
				and(
					eq(animeToGenreTable.animeId, data.animeId),
					eq(animeToGenreTable.genreId, data.genreId),
					eq(animeToGenreTable.role, data.role),
				),
			)
			.limit(1);

		return result[0] || null;
	}
}
