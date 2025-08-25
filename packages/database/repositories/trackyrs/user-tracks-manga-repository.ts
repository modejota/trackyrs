import { and, eq, sql } from "drizzle-orm";
import { database } from "../../index";
import { mangaGenreTable } from "../../schemas/myanimelist/manga/manga-genre-schema";
import { mangaTable } from "../../schemas/myanimelist/manga/manga-schema";
import { mangaToGenreTable } from "../../schemas/myanimelist/manga/manga-to-genre-schema";
import {
	type NewUserTracksManga,
	userTracksMangaTable,
} from "../../schemas/trackyrs/user-tracks-manga-schema";
import type { UserTracksMangaGroupedItem } from "../../types/manga-tracks";
import { UserTracksMangaStatus } from "../../types/manga-tracks";

export default class UserTracksMangaRepository {
	static async findByUserIdAndMangaId(userId: string, mangaId: number) {
		const result = await database
			.select()
			.from(userTracksMangaTable)
			.where(
				and(
					eq(userTracksMangaTable.userId, userId),
					eq(userTracksMangaTable.mangaId, mangaId),
				),
			)
			.limit(1);
		return result[0] ?? null;
	}

	static async insert(
		track: Pick<NewUserTracksManga, "mangaId" | "userId"> &
			Partial<NewUserTracksManga>,
	) {
		const values: NewUserTracksManga = {
			mangaId: track.mangaId,
			userId: track.userId,
			status: track.status ?? UserTracksMangaStatus.PLAN_TO_READ,
			score: track.score ?? null,
			chaptersRead: track.chaptersRead ?? null,
			startDate: track.startDate ?? new Date().toISOString(),
			endDate: track.endDate ?? new Date().toISOString(),
			rereads: track.rereads ?? null,
		};

		const inserted = await database
			.insert(userTracksMangaTable)
			.values(values)
			.returning();
		return inserted[0];
	}

	static async updateByUserIdAndMangaId(
		userId: string,
		mangaId: number,
		patch: Partial<NewUserTracksManga>,
	) {
		const setObj: Partial<NewUserTracksManga> = {};
		if (patch.status !== undefined) setObj.status = patch.status;
		if (patch.score !== undefined) setObj.score = patch.score;
		if (patch.chaptersRead !== undefined)
			setObj.chaptersRead = patch.chaptersRead;
		if (patch.startDate !== undefined) setObj.startDate = patch.startDate;
		if (patch.endDate !== undefined) setObj.endDate = patch.endDate;
		if (patch.rereads !== undefined) setObj.rereads = patch.rereads;

		const updated = await database
			.update(userTracksMangaTable)
			.set(setObj)
			.where(
				and(
					eq(userTracksMangaTable.userId, userId),
					eq(userTracksMangaTable.mangaId, mangaId),
				),
			)
			.returning();

		return updated[0] ?? null;
	}

	static async deleteByUserIdAndMangaId(userId: string, mangaId: number) {
		const deleted = await database
			.delete(userTracksMangaTable)
			.where(
				and(
					eq(userTracksMangaTable.userId, userId),
					eq(userTracksMangaTable.mangaId, mangaId),
				),
			)
			.returning();
		return deleted[0] ?? null;
	}

	static async findGroupedByStatusForUser(userId: string) {
		const rows = await database
			.select({
				status: userTracksMangaTable.status,
				mangaId: userTracksMangaTable.mangaId,
				score: userTracksMangaTable.score,
				title: mangaTable.title,
				images: mangaTable.images,
				type: mangaTable.type,
				genres: sql<
					string[]
				>`coalesce(array_agg(distinct ${mangaGenreTable.name}) FILTER (WHERE ${mangaGenreTable.name} IS NOT NULL), '{}')`,
			})
			.from(userTracksMangaTable)
			.leftJoin(mangaTable, eq(mangaTable.id, userTracksMangaTable.mangaId))
			.leftJoin(mangaToGenreTable, eq(mangaToGenreTable.mangaId, mangaTable.id))
			.leftJoin(
				mangaGenreTable,
				eq(mangaToGenreTable.genreId, mangaGenreTable.id),
			)
			.where(eq(userTracksMangaTable.userId, userId))
			.groupBy(
				userTracksMangaTable.status,
				userTracksMangaTable.mangaId,
				userTracksMangaTable.score,
				mangaTable.title,
				mangaTable.images,
				mangaTable.type,
			);

		const initial: Record<UserTracksMangaStatus, UserTracksMangaGroupedItem[]> =
			{
				[UserTracksMangaStatus.READING]: [],
				[UserTracksMangaStatus.COMPLETED]: [],
				[UserTracksMangaStatus.DROPPED]: [],
				[UserTracksMangaStatus.PAUSED]: [],
				[UserTracksMangaStatus.PLAN_TO_READ]: [],
				[UserTracksMangaStatus.REREADING]: [],
			};

		for (const r of rows) {
			const item: UserTracksMangaGroupedItem = {
				mangaId: r.mangaId,
				title: r.title ?? null,
				images: r.images ?? null,
				type: r.type,
				score: r.score ?? null,
				status: r.status ?? null,
				genres: (r.genres ?? []) as string[] | null,
			};
			const status =
				(item.status as UserTracksMangaStatus) ??
				UserTracksMangaStatus.PLAN_TO_READ;
			initial[status].push(item);
		}

		return initial;
	}
}
