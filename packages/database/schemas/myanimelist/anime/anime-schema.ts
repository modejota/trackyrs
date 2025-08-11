import { relations, sql } from "drizzle-orm";
import {
	boolean,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { animeEpisodeTable } from "@/schemas/myanimelist/anime/anime-episode-schema";
import { animeToCharacterTable } from "@/schemas/myanimelist/anime/anime-to-character-schema";
import { animeToGenreTable } from "@/schemas/myanimelist/anime/anime-to-genre-schema";
import { animeToPeopleTable } from "@/schemas/myanimelist/anime/anime-to-people-schema";
import { animeToProducersTable } from "@/schemas/myanimelist/anime/anime-to-producers-schema";

export enum AnimeType {
	TV = "TV",
	OVA = "OVA",
	MOVIE = "Movie",
	SPECIAL = "Special",
	ONA = "ONA",
	MUSIC = "Music",
	CM = "CM",
	PV = "PV",
	TV_SPECIAL = "TV Special",
}

export type AnimeTypeNullable = AnimeType | null;

export enum AnimeStatus {
	FINISHED_AIRING = "Finished Airing",
	CURRENTLY_AIRING = "Currently Airing",
	NOT_YET_AIRED = "Not yet aired",
}

export type AnimeStatusNullable = AnimeStatus | null;

export enum Rating {
	G = "G - All Ages",
	PG = "PG - Children",
	PG_13 = "PG-13 - Teens 13 or older",
	R_17 = "R - 17+ (violence & profanity)",
	R_PLUS = "R+ - Mild Nudity",
	RX = "Rx - Hentai",
}

export type RatingNullable = Rating | null;

export enum Season {
	WINTER = "winter",
	SPRING = "spring",
	SUMMER = "summer",
	FALL = "fall",
}

export type SeasonNullable = Season | null;

export enum DaysOfWeek {
	MONDAY = "Mondays",
	TUESDAY = "Tuesdays",
	WEDNESDAY = "Wednesdays",
	THURSDAY = "Thursdays",
	FRIDAY = "Fridays",
	SATURDAY = "Saturdays",
	SUNDAY = "Sundays",
}

export type DaysOfWeekNullable = DaysOfWeek | null;

export interface AnimeTitleInfo {
	type: string;
	title: string;
}

export interface AnimeThemeInfo {
	openings: string[];
	endings: string[];
}

export interface AnimeExternalLink {
	name: string;
	url: string;
}

export interface AnimeStreamingInfo {
	name: string;
	url: string;
}

export const animeTable = pgTable("animes", {
	id: integer("id").primaryKey(),
	approved: boolean("approved").notNull().default(false),
	images: text("images").notNull(),
	trailer: text("trailer"),
	title: text("title").notNull(),
	titles: jsonb("titles").notNull().$type<Array<AnimeTitleInfo>>(),
	titleEnglish: text("title_english"),
	titleJapanese: text("title_japanese"),
	titleSynonyms: jsonb("title_synonyms")
		.$type<string[]>()
		.default(sql`'[]'::jsonb`),
	type: varchar("type", { length: 16 }).$type<AnimeTypeNullable>(),
	source: text("source"),
	numberEpisodes: integer("number_episodes"),
	status: varchar("status", { length: 32 }).$type<AnimeStatusNullable>(),
	airing: boolean("airing").notNull().default(false),
	airedFrom: timestamp("aired_from", { mode: "string", withTimezone: false }),
	airedTo: timestamp("aired_to", { mode: "string", withTimezone: false }),
	duration: integer("duration"),
	rating: varchar("rating", { length: 32 }).$type<RatingNullable>(),
	synopsis: text("synopsis"),
	background: text("background"),
	season: varchar("season", { length: 8 }).$type<SeasonNullable>(),
	year: integer("year"),
	broadcastDay: varchar("broadcast_day", {
		length: 10,
	}).$type<DaysOfWeekNullable>(),
	broadcastTime: varchar("broadcast_time", { length: 5 }),
	broadcastTimezone: varchar("broadcast_timezone", { length: 16 }),
	theme: jsonb("theme")
		.$type<Array<AnimeThemeInfo>>()
		.default(sql`'[]'::jsonb`),
	external: jsonb("external")
		.$type<Array<AnimeExternalLink>>()
		.default(sql`'[]'::jsonb`),
	streaming: jsonb("streaming")
		.$type<Array<AnimeStreamingInfo>>()
		.default(sql`'[]'::jsonb`),
});

export const animeRelations = relations(animeTable, ({ many }) => ({
	episodes: many(animeEpisodeTable),
	genres: many(animeToGenreTable),
	producers: many(animeToProducersTable),
	characters: many(animeToCharacterTable),
	staff: many(animeToPeopleTable),
}));

export type Anime = typeof animeTable.$inferSelect;
export type NewAnime = typeof animeTable.$inferInsert;
