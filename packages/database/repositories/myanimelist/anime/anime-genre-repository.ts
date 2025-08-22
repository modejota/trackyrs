import { eq } from "drizzle-orm";
import { animeGenreTable, database } from "../../../index";
import type {
	AnimeGenre,
	NewAnimeGenre,
} from "../../../schemas/myanimelist/anime/anime-genre-schema";

export default class AnimeGenreRepository {
	static async findById(id: number) {
		const result = await database
			.select()
			.from(animeGenreTable)
			.where(eq(animeGenreTable.id, id))
			.limit(1);
		return result[0];
	}
	static async insert(genre: NewAnimeGenre) {
		return await database
			.insert(animeGenreTable)
			.values(genre)
			.onConflictDoNothing({ target: animeGenreTable.id });
	}

	static async upsert(genre: NewAnimeGenre): Promise<AnimeGenre> {
		const result = await database
			.insert(animeGenreTable)
			.values(genre)
			.onConflictDoUpdate({
				target: animeGenreTable.id,
				set: genre,
			})
			.returning();
		return result[0] as AnimeGenre;
	}

	static async findDistinctGenres() {
		const result = await database
			.selectDistinctOn([animeGenreTable.name])
			.from(animeGenreTable)
			.orderBy(animeGenreTable.name);

		return result.map((row) => row.name);
	}
}
