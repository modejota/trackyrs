import { sql } from "drizzle-orm";
import {
	boolean,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

export enum MangaType {
	MANGA = "Manga",
	NOVEL = "Novel",
	LIGHT_NOVEL = "Light Novel",
	ONE_SHOT = "One-shot",
	DOUJINSHI = "Doujinshi",
	MANHWA = "Manhwa",
	MANHUA = "Manhua",
}

export enum MangaStatus {
	FINISHED = "Finished",
	PUBLISHING = "Publishing",
	ON_HIATUS = "On Hiatus",
	DISCONTINUED = "Discontinued",
	NOT_YET_PUBLISHED = "Not yet published",
}

export interface TitleInfo {
	type: string;
	title: string;
}

export const mangaTable = pgTable("mangas", {
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
});

export type Manga = typeof mangaTable.$inferSelect;
export type NewManga = typeof mangaTable.$inferInsert;
