import {
	and,
	asc,
	countDistinct,
	desc,
	eq,
	gte,
	ilike,
	inArray,
	isNotNull,
	or,
	sql,
} from "drizzle-orm";
import { database, mangaTable } from "@/index";
import { mangaGenreTable } from "@/schemas/myanimelist/manga/manga-genre-schema";
import type { Manga, NewManga } from "@/schemas/myanimelist/manga/manga-schema";
import { mangaToGenreTable } from "@/schemas/myanimelist/manga/manga-to-genre-schema";
import type { MangaStatus, MangaType } from "@/types/manga-with-relations";

export default class MangaRepository {
	static async findById(id: number) {
		const result = await database
			.select()
			.from(mangaTable)
			.where(eq(mangaTable.id, id))
			.limit(1);
		return result[0];
	}

	static async findByIdWithRelations(id: number) {
		const result = await database.query.mangaTable.findFirst({
			where: eq(mangaTable.id, id),
			with: {
				genres: { with: { genre: true } },
				magazines: { with: { magazine: true } },
				characters: {
					with: { character: true },
					orderBy: sql`CASE WHEN role = 'Main' THEN 0 ELSE 1 END`,
				},
				staff: { with: { people: true } },
			},
		});

		if (!result) return null;

		const { genres, magazines, characters, staff, ...manga } = result;

		return {
			manga,
			genres,
			magazines,
			characters,
			staff,
		};
	}

	static async insert(manga: NewManga) {
		return await database
			.insert(mangaTable)
			.values(manga)
			.onConflictDoNothing({ target: mangaTable.id });
	}

	static async update(id: number, manga: NewManga) {
		return await database
			.update(mangaTable)
			.set(manga)
			.where(eq(mangaTable.id, id));
	}

	static async upsert(manga: NewManga): Promise<Manga> {
		const result = await database
			.insert(mangaTable)
			.values(manga)
			.onConflictDoUpdate({
				target: mangaTable.id,
				set: manga,
			})
			.returning();
		return result[0] as Manga;
	}

	static async findIdsFromRangeGreaterThanOrEqual(
		startId: number,
	): Promise<number[]> {
		const result = await database
			.select({ id: mangaTable.id })
			.from(mangaTable)
			.where(gte(mangaTable.id, startId))
			.orderBy(mangaTable.id);

		return result.map((row) => row.id);
	}

	static async findDistinctYears() {
		const yearExpr =
			sql<number>`EXTRACT(YEAR FROM ${mangaTable.publishingFrom})`.as("year");

		const result = await database
			.select({ year: yearExpr })
			.from(mangaTable)
			.where(sql`${mangaTable.publishingFrom} IS NOT NULL`)
			.groupBy(yearExpr)
			.orderBy(desc(yearExpr));

		return result
			.map((row) => row.year)
			.filter((year): year is number => year !== null);
	}

	static async findTopByReferenceScore(limit = 50, offset = 0) {
		return await database
			.select()
			.from(mangaTable)
			.where(isNotNull(mangaTable.referenceScoredBy))
			.orderBy(
				sql`${mangaTable.referenceScore} IS NULL`,
				desc(mangaTable.referenceScore),
				asc(mangaTable.title),
			)
			.limit(limit)
			.offset(offset);
	}

	static async findOngoing(limit = 50, offset = 0) {
		return await database
			.select()
			.from(mangaTable)
			.where(
				and(
					eq(mangaTable.publishing, true),
					isNotNull(mangaTable.referenceScore),
				),
			)
			.orderBy(
				sql`${mangaTable.referenceScore} IS NULL`,
				desc(mangaTable.referenceScore),
				asc(mangaTable.title),
			)
			.limit(limit)
			.offset(offset);
	}

	static async search(
		criteria: {
			years?: number[];
			statuses?: MangaStatus[];
			types?: MangaType[];
			genres?: string[];
			title?: string;
		},
		limit = 20,
		offset = 0,
	) {
		const conditions = [];

		if (criteria.years && criteria.years.length > 0) {
			const yearConditions = criteria.years.map(
				(year) =>
					sql`EXTRACT(YEAR FROM ${mangaTable.publishingFrom}) = ${year}`,
			);
			conditions.push(or(...yearConditions));
		}

		if (criteria.statuses && criteria.statuses.length > 0) {
			conditions.push(inArray(mangaTable.status, criteria.statuses));
		}

		if (criteria.types && criteria.types.length > 0) {
			conditions.push(inArray(mangaTable.type, criteria.types));
		}

		if (criteria.title && criteria.title.trim()) {
			const titleSearch = `%${criteria.title.trim()}%`;
			conditions.push(
				or(
					ilike(mangaTable.title, titleSearch),
					ilike(mangaTable.titleEnglish, titleSearch),
				),
			);
		}

		if (criteria.genres && criteria.genres.length > 0) {
			const genreFilteredIds = await database
				.select({ mangaId: mangaToGenreTable.mangaId })
				.from(mangaToGenreTable)
				.innerJoin(
					mangaGenreTable,
					eq(mangaToGenreTable.genreId, mangaGenreTable.id),
				)
				.where(inArray(mangaGenreTable.name, criteria.genres))
				.groupBy(mangaToGenreTable.mangaId)
				.having(
					gte(countDistinct(mangaGenreTable.name), criteria.genres.length),
				);

			const filteredIds = genreFilteredIds.map((row) => row.mangaId);
			if (filteredIds.length === 0) return [];

			conditions.push(inArray(mangaTable.id, filteredIds));
		}

		return await database
			.select()
			.from(mangaTable)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(
				sql`${mangaTable.referenceScore} IS NULL`,
				desc(mangaTable.referenceScore),
				asc(mangaTable.title),
			)
			.limit(limit)
			.offset(offset);
	}
}
