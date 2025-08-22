import { and, eq, sql } from "drizzle-orm";
import { database } from "../../index";
import {
	type AnimeMangaRelation,
	animeMangaRelationTable,
	type NewAnimeMangaRelation,
} from "../../schemas/myanimelist/anime-manga-relation";

export default class AnimeMangaRelationRepository {
	static async findByAnimeSource(
		animeId: number,
	): Promise<AnimeMangaRelation[]> {
		return await database
			.select()
			.from(animeMangaRelationTable)
			.where(eq(animeMangaRelationTable.animeSourceId, animeId));
	}

	static async findByMangaSource(
		mangaId: number,
	): Promise<AnimeMangaRelation[]> {
		return await database
			.select()
			.from(animeMangaRelationTable)
			.where(eq(animeMangaRelationTable.mangaSourceId, mangaId));
	}

	static async insert(data: NewAnimeMangaRelation) {
		return await database
			.insert(animeMangaRelationTable)
			.values(data)
			.returning();
	}

	static async insertMany(
		data: NewAnimeMangaRelation[],
	): Promise<AnimeMangaRelation[]> {
		if (data.length === 0) return [];

		return await database
			.insert(animeMangaRelationTable)
			.values(data)
			.returning();
	}

	static async upsert(
		data: NewAnimeMangaRelation,
	): Promise<AnimeMangaRelation> {
		const result = await database
			.insert(animeMangaRelationTable)
			.values(data)
			.onConflictDoUpdate({
				target: [
					animeMangaRelationTable.animeSourceId,
					animeMangaRelationTable.mangaSourceId,
					animeMangaRelationTable.animeDestinationId,
					animeMangaRelationTable.mangaDestinationId,
					animeMangaRelationTable.type,
				],
				set: data,
			})
			.returning();
		return result[0] as AnimeMangaRelation;
	}

	static async upsertMany(
		data: NewAnimeMangaRelation[],
	): Promise<AnimeMangaRelation[]> {
		if (data.length === 0) return [];

		const result = await database
			.insert(animeMangaRelationTable)
			.values(data)
			.onConflictDoUpdate({
				target: [
					animeMangaRelationTable.animeSourceId,
					animeMangaRelationTable.mangaSourceId,
					animeMangaRelationTable.animeDestinationId,
					animeMangaRelationTable.mangaDestinationId,
					animeMangaRelationTable.type,
				],
				set: {
					animeSourceId: sql`excluded.anime_source_id`,
					mangaSourceId: sql`excluded.manga_source_id`,
					animeDestinationId: sql`excluded.anime_destination_id`,
					mangaDestinationId: sql`excluded.manga_destination_id`,
					type: sql`excluded.type`,
				},
			})
			.returning();
		return result as AnimeMangaRelation[];
	}

	private static async findExisting(
		data: NewAnimeMangaRelation,
	): Promise<AnimeMangaRelation | null> {
		const conditions = [];

		if (data.animeSourceId) {
			conditions.push(
				eq(animeMangaRelationTable.animeSourceId, data.animeSourceId),
			);
		}
		if (data.mangaSourceId) {
			conditions.push(
				eq(animeMangaRelationTable.mangaSourceId, data.mangaSourceId),
			);
		}
		if (data.animeDestinationId) {
			conditions.push(
				eq(animeMangaRelationTable.animeDestinationId, data.animeDestinationId),
			);
		}
		if (data.mangaDestinationId) {
			conditions.push(
				eq(animeMangaRelationTable.mangaDestinationId, data.mangaDestinationId),
			);
		}
		if (data.type) {
			conditions.push(eq(animeMangaRelationTable.type, data.type));
		}

		if (conditions.length === 0) return null;

		const result = await database
			.select()
			.from(animeMangaRelationTable)
			.where(and(...conditions))
			.limit(1);

		return result[0] || null;
	}
}
