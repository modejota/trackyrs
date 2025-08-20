import {
	and,
	asc,
	countDistinct,
	desc,
	eq,
	gt,
	gte,
	ilike,
	inArray,
	isNull,
	or,
	sql,
} from "drizzle-orm";
import { database } from "@/index";
import { animeEpisodeTable } from "@/schemas/myanimelist/anime/anime-episode-schema";
import { animeGenreTable } from "@/schemas/myanimelist/anime/anime-genre-schema";
import type { Anime, NewAnime } from "@/schemas/myanimelist/anime/anime-schema";
import { animeTable } from "@/schemas/myanimelist/anime/anime-schema";
import { animeToGenreTable } from "@/schemas/myanimelist/anime/anime-to-genre-schema";
import type {
	AnimeStatus,
	AnimeType,
	Season,
	SeasonNullable,
} from "@/types/anime-with-relations";

export default class AnimeRepository {
	static async findById(id: number) {
		const result = await database
			.select()
			.from(animeTable)
			.where(eq(animeTable.id, id))
			.limit(1);
		return result[0];
	}

	static async findByIdWithRelations(id: number) {
		const result = await database.query.animeTable.findFirst({
			where: eq(animeTable.id, id),
			with: {
				genres: { with: { genre: true } },
				episodes: { orderBy: asc(animeEpisodeTable.episodeNumber) },
				characters: {
					with: { character: true },
					orderBy: sql`CASE WHEN role = 'Main' THEN 0 ELSE 1 END`,
				},
				staff: { with: { people: true } },
			},
		});

		if (!result) return null;

		const { genres, episodes, characters, staff, ...anime } = result;

		return {
			anime,
			genres,
			episodes,
			characters,
			staff,
		};
	}

	static async insert(anime: NewAnime) {
		return await database
			.insert(animeTable)
			.values(anime)
			.onConflictDoNothing({ target: animeTable.id });
	}

	static async update(id: number, anime: NewAnime) {
		return await database
			.update(animeTable)
			.set(anime)
			.where(eq(animeTable.id, id));
	}

	static async upsert(anime: NewAnime): Promise<Anime> {
		const result = await database
			.insert(animeTable)
			.values(anime)
			.onConflictDoUpdate({
				target: animeTable.id,
				set: anime,
			})
			.returning();
		return result[0] as Anime;
	}

	static async findIdsFromRange(startId?: number): Promise<number[]> {
		const query = database.select({ id: animeTable.id }).from(animeTable);

		if (startId) {
			query.where(gte(animeTable.id, startId));
		}

		const result = await query.orderBy(animeTable.id);
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

	static async findBySeason(season: SeasonNullable, year: number | null) {
		const seasonCondition =
			season === null
				? isNull(animeTable.season)
				: eq(animeTable.season, season);

		const yearCondition =
			year === null ? isNull(animeTable.year) : eq(animeTable.year, year);

		return await database
			.select()
			.from(animeTable)
			.where(and(seasonCondition, yearCondition))
			.orderBy(
				sql`${animeTable.referenceScore} IS NULL`,
				desc(animeTable.referenceScore),
				asc(animeTable.title),
			);
	}

	static async findDistinctYears() {
		const result = await database
			.selectDistinctOn([animeTable.year])
			.from(animeTable)
			.orderBy(desc(animeTable.year));

		return result.map((row) => row.year);
	}

	static async findTopByReferenceScore(limit = 50, offset = 0) {
		return await database
			.select()
			.from(animeTable)
			.where(gt(animeTable.referenceScoredBy, 0))
			.orderBy(
				sql`${animeTable.referenceScore} IS NULL`,
				desc(animeTable.referenceScore),
				asc(animeTable.title),
			)
			.limit(limit)
			.offset(offset);
	}

	static async search(
		criteria: {
			years?: number[];
			seasons?: Season[];
			types?: AnimeType[];
			statuses?: AnimeStatus[];
			genres?: string[];
			title?: string;
		},
		limit = 20,
		offset = 0,
	) {
		const conditions = [];

		if (criteria.years && criteria.years.length > 0) {
			conditions.push(inArray(animeTable.year, criteria.years));
		}

		if (criteria.seasons && criteria.seasons.length > 0) {
			conditions.push(inArray(animeTable.season, criteria.seasons));
		}

		if (criteria.types && criteria.types.length > 0) {
			conditions.push(inArray(animeTable.type, criteria.types));
		}

		if (criteria.statuses && criteria.statuses.length > 0) {
			conditions.push(inArray(animeTable.status, criteria.statuses));
		}

		if (criteria.title && criteria.title.trim()) {
			const titleSearch = `%${criteria.title.trim()}%`;
			conditions.push(
				or(
					ilike(animeTable.title, titleSearch),
					ilike(animeTable.titleEnglish, titleSearch),
				),
			);
		}

		if (criteria.genres && criteria.genres.length > 0) {
			const genreFilteredIds = await database
				.select({ animeId: animeToGenreTable.animeId })
				.from(animeToGenreTable)
				.innerJoin(
					animeGenreTable,
					eq(animeToGenreTable.genreId, animeGenreTable.id),
				)
				.where(inArray(animeGenreTable.name, criteria.genres))
				.groupBy(animeToGenreTable.animeId)
				.having(
					gte(countDistinct(animeGenreTable.name), criteria.genres.length),
				);

			const filteredIds = genreFilteredIds.map((row) => row.animeId);
			if (filteredIds.length === 0) return [];

			conditions.push(inArray(animeTable.id, filteredIds));
		}

		return await database
			.select()
			.from(animeTable)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(
				sql`${animeTable.referenceScore} IS NULL`,
				desc(animeTable.referenceScore),
				asc(animeTable.title),
			)
			.limit(limit)
			.offset(offset);
	}
}
