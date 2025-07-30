import { and, eq, sql } from "drizzle-orm";

import { animeEpisodeTable, database } from "@/index";
import type {
	AnimeEpisode,
	NewAnimeEpisode,
} from "@/schemas/myanimelist/anime/anime-episode-schema";

export default class AnimeEpisodeRepository {
	static async findByAnimeIdAndEpisodeNumber(
		animeId: number,
		episodeNumber: number,
	) {
		const result = await database
			.select()
			.from(animeEpisodeTable)
			.where(
				and(
					eq(animeEpisodeTable.animeId, animeId),
					eq(animeEpisodeTable.episodeNumber, episodeNumber),
				),
			)
			.limit(1);
		return result[0] || null;
	}

	static async findByAnimeId(animeId: number) {
		return await database
			.select()
			.from(animeEpisodeTable)
			.where(eq(animeEpisodeTable.animeId, animeId));
	}

	static async insert(episode: NewAnimeEpisode) {
		return await database
			.insert(animeEpisodeTable)
			.values(episode)
			.onConflictDoNothing();
	}

	static async insertMany(episodes: NewAnimeEpisode[]) {
		if (episodes.length === 0) return { rowCount: 0 };
		return await database
			.insert(animeEpisodeTable)
			.values(episodes)
			.onConflictDoNothing();
	}

	static async update(
		animeId: number,
		episodeNumber: number,
		episode: Partial<NewAnimeEpisode>,
	) {
		return await database
			.update(animeEpisodeTable)
			.set(episode)
			.where(
				and(
					eq(animeEpisodeTable.animeId, animeId),
					eq(animeEpisodeTable.episodeNumber, episodeNumber),
				),
			);
	}

	static async upsert(episode: NewAnimeEpisode): Promise<AnimeEpisode> {
		const result = await database
			.insert(animeEpisodeTable)
			.values(episode)
			.onConflictDoUpdate({
				target: [animeEpisodeTable.animeId, animeEpisodeTable.episodeNumber],
				set: episode,
			})
			.returning();
		return result[0] as AnimeEpisode;
	}

	static async upsertMany(
		episodes: NewAnimeEpisode[],
	): Promise<AnimeEpisode[]> {
		if (episodes.length === 0) return [];
		const result = await database
			.insert(animeEpisodeTable)
			.values(episodes)
			.onConflictDoUpdate({
				target: [animeEpisodeTable.animeId, animeEpisodeTable.episodeNumber],
				set: {
					animeId: sql`excluded.anime_id`,
					episodeNumber: sql`excluded.episode_number`,
					title: sql`excluded.title`,
					titleJapanese: sql`excluded.title_japanese`,
					titleRomaji: sql`excluded.title_romaji`,
					aired: sql`excluded.aired`,
					filler: sql`excluded.filler`,
					recap: sql`excluded.recap`,
				},
			})
			.returning();
		return result as AnimeEpisode[];
	}

	static async exists(
		animeId: number,
		episodeNumber: number,
	): Promise<boolean> {
		const result = await database
			.select({ id: animeEpisodeTable.id })
			.from(animeEpisodeTable)
			.where(
				and(
					eq(animeEpisodeTable.animeId, animeId),
					eq(animeEpisodeTable.episodeNumber, episodeNumber),
				),
			)
			.limit(1);
		return result.length > 0;
	}
}
