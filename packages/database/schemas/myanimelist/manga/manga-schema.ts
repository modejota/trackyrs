import { relations, sql } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	jsonb,
	pgTable,
	real,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import type {
	MangaStatus,
	MangaType,
	TitleInfo,
} from "../../../types/manga-with-relations";
import { mangaToCharacterTable } from "./manga-to-character-schema";
import { mangaToGenreTable } from "./manga-to-genre-schema";
import { mangaToMagazineTable } from "./manga-to-magazine-schema";
import { mangaToPeopleTable } from "./manga-to-people-schema";

export const mangaTable = pgTable(
	"mangas",
	{
		id: integer("id").primaryKey(),
		approved: boolean("approved").notNull().default(false),
		images: text("images").notNull(),
		title: text("title").notNull(),
		titles: jsonb("titles").notNull().$type<Array<TitleInfo>>(),
		titleEnglish: text("title_english"),
		titleJapanese: text("title_japanese"),
		titleSynonyms: jsonb("title_synonyms")
			.$type<string[]>()
			.default(sql`'[]'::jsonb`),
		type: varchar("type", { length: 12 }).$type<MangaType>(),
		numberChapters: integer("number_chapters"),
		numberVolumes: integer("number_volumes"),
		status: varchar("status", { length: 12 }).$type<MangaStatus>(),
		publishing: boolean("publishing").notNull().default(false),
		publishingFrom: timestamp("publishing_from", {
			mode: "string",
			withTimezone: true,
		}),
		publishingTo: timestamp("publishing_to", {
			mode: "string",
			withTimezone: true,
		}),
		synopsis: text("synopsis"),
		background: text("background"),
		external: jsonb("external")
			.$type<Array<Record<string, string>>>()
			.default(sql`'[]'::jsonb`),
		referenceScore: real("reference_score").default(0),
		referenceScoredBy: integer("reference_scored_by").default(0),
	},
	(table) => ({
		titleGinIdx: index("idx_manga_title_gin").using(
			"gin",
			sql`${table.title} gin_trgm_ops`,
		),
		titleEnglishGinIdx: index("idx_manga_title_english_gin").using(
			"gin",
			sql`${table.titleEnglish} gin_trgm_ops`,
		),
	}),
);

export const mangaRelations = relations(mangaTable, ({ many }) => ({
	genres: many(mangaToGenreTable),
	magazines: many(mangaToMagazineTable),
	characters: many(mangaToCharacterTable),
	staff: many(mangaToPeopleTable),
}));

export type Manga = typeof mangaTable.$inferSelect;
export type NewManga = typeof mangaTable.$inferInsert;
