import { and, eq, sql } from "drizzle-orm";
import { database } from "../../../index";
import {
	type AnimeToGenre,
	animeToGenreTable,
	type NewAnimeToGenre,
} from "../../../schemas/myanimelist/anime/anime-to-genre-schema";

export default class AnimeToGenreRepository {
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

	static async upsert(data: NewAnimeToGenre): Promise<AnimeToGenre> {
		const result = await database
			.insert(animeToGenreTable)
			.values(data)
			.onConflictDoUpdate({
				target: [
					animeToGenreTable.animeId,
					animeToGenreTable.genreId,
					animeToGenreTable.role,
				],
				set: data,
			})
			.returning();
		return result[0] as AnimeToGenre;
	}

	static async upsertMany(data: NewAnimeToGenre[]): Promise<AnimeToGenre[]> {
		if (data.length === 0) return [];

		const result = await database
			.insert(animeToGenreTable)
			.values(data)
			.onConflictDoUpdate({
				target: [
					animeToGenreTable.animeId,
					animeToGenreTable.genreId,
					animeToGenreTable.role,
				],
				set: {
					animeId: sql`excluded.anime_id`,
					genreId: sql`excluded.genre_id`,
					role: sql`excluded.role`,
				},
			})
			.returning();
		return result as AnimeToGenre[];
	}
}
