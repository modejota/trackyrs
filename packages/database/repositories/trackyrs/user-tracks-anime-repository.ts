import { and, eq, sql } from "drizzle-orm";
import { database } from "../../index";
import { animeGenreTable } from "../../schemas/myanimelist/anime/anime-genre-schema";
import { animeTable } from "../../schemas/myanimelist/anime/anime-schema";
import { animeToGenreTable } from "../../schemas/myanimelist/anime/anime-to-genre-schema";
import {
	type NewUserTracksAnime,
	userTracksAnimeTable,
} from "../../schemas/trackyrs/user-tracks-anime-schema";
import type { UserTracksAnimeGroupedItem } from "../../types/anime-tracks";
import { UserTracksAnimeStatus } from "../../types/anime-tracks";

export default class UserTracksAnimeRepository {
	static async findByUserIdAndAnimeId(userId: string, animeId: number) {
		const result = await database
			.select()
			.from(userTracksAnimeTable)
			.where(
				and(
					eq(userTracksAnimeTable.userId, userId),
					eq(userTracksAnimeTable.animeId, animeId),
				),
			)
			.limit(1);
		return result[0] ?? null;
	}

	static async insert(
		track: Pick<NewUserTracksAnime, "animeId" | "userId"> &
			Partial<NewUserTracksAnime>,
	) {
		const values: NewUserTracksAnime = {
			animeId: track.animeId,
			userId: track.userId,
			status: track.status ?? UserTracksAnimeStatus.PLAN_TO_WATCH,
			score: track.score ?? null,
			episodesWatched: track.episodesWatched ?? null,
			startDate: track.startDate ?? null,
			endDate: track.endDate ?? null,
			rewatches: track.rewatches ?? null,
		};

		const inserted = await database
			.insert(userTracksAnimeTable)
			.values(values)
			.returning();
		return inserted[0];
	}

	static async updateByUserIdAndAnimeId(
		userId: string,
		animeId: number,
		patch: Partial<NewUserTracksAnime>,
	) {
		const setObj: Partial<NewUserTracksAnime> = {};
		if (patch.status !== undefined) setObj.status = patch.status;
		if (patch.score !== undefined) setObj.score = patch.score;
		if (patch.episodesWatched !== undefined)
			setObj.episodesWatched = patch.episodesWatched;
		if (patch.startDate !== undefined) setObj.startDate = patch.startDate;
		if (patch.endDate !== undefined) setObj.endDate = patch.endDate;
		if (patch.rewatches !== undefined) setObj.rewatches = patch.rewatches;

		const updated = await database
			.update(userTracksAnimeTable)
			.set(setObj)
			.where(
				and(
					eq(userTracksAnimeTable.userId, userId),
					eq(userTracksAnimeTable.animeId, animeId),
				),
			)
			.returning();

		return updated[0] ?? null;
	}

	static async deleteByUserIdAndAnimeId(userId: string, animeId: number) {
		const deleted = await database
			.delete(userTracksAnimeTable)
			.where(
				and(
					eq(userTracksAnimeTable.userId, userId),
					eq(userTracksAnimeTable.animeId, animeId),
				),
			)
			.returning();
		return deleted[0] ?? null;
	}

	static async findGroupedByStatusForUser(userId: string) {
		const rows = await database
			.select({
				status: userTracksAnimeTable.status,
				animeId: userTracksAnimeTable.animeId,
				score: userTracksAnimeTable.score,
				episodesWatched: userTracksAnimeTable.episodesWatched,
				title: animeTable.title,
				images: animeTable.images,
				type: animeTable.type,
				season: animeTable.season,
				year: animeTable.year,
				duration: animeTable.duration,
				numberEpisodes: animeTable.numberEpisodes,
				genres: sql<
					string[]
				>`coalesce(array_agg(distinct ${animeGenreTable.name}) FILTER (WHERE ${animeGenreTable.name} IS NOT NULL), '{}')`,
			})
			.from(userTracksAnimeTable)
			.leftJoin(animeTable, eq(animeTable.id, userTracksAnimeTable.animeId))
			.leftJoin(animeToGenreTable, eq(animeToGenreTable.animeId, animeTable.id))
			.leftJoin(
				animeGenreTable,
				eq(animeToGenreTable.genreId, animeGenreTable.id),
			)
			.where(eq(userTracksAnimeTable.userId, userId))
			.groupBy(
				userTracksAnimeTable.status,
				userTracksAnimeTable.animeId,
				userTracksAnimeTable.score,
				userTracksAnimeTable.episodesWatched,
				animeTable.title,
				animeTable.images,
				animeTable.type,
				animeTable.season,
				animeTable.year,
				animeTable.duration,
				animeTable.numberEpisodes,
			);

		const initial: Record<UserTracksAnimeStatus, UserTracksAnimeGroupedItem[]> =
			{
				[UserTracksAnimeStatus.WATCHING]: [],
				[UserTracksAnimeStatus.COMPLETED]: [],
				[UserTracksAnimeStatus.DROPPED]: [],
				[UserTracksAnimeStatus.PAUSED]: [],
				[UserTracksAnimeStatus.PLAN_TO_WATCH]: [],
				[UserTracksAnimeStatus.REWATCHING]: [],
			};

		for (const r of rows) {
			const item: UserTracksAnimeGroupedItem = {
				animeId: r.animeId,
				title: r.title ?? null,
				images: r.images ?? null,
				type: r.type,
				season: r.season,
				year: r.year ?? null,
				score: r.score ?? null,
				status: r.status ?? null,
				genres: (r.genres ?? []) as string[] | null,
				episodesWatched: r.episodesWatched ?? null,
				duration: r.duration ?? null,
				numberEpisodes: r.numberEpisodes ?? null,
			};
			const status =
				(item.status as UserTracksAnimeStatus) ??
				UserTracksAnimeStatus.PLAN_TO_WATCH;
			initial[status].push(item);
		}

		return initial;
	}
}
