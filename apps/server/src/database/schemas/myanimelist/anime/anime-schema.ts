import { relations, sql } from "drizzle-orm";
import {
	boolean,
	integer,
	jsonb,
	pgTable,
	serial,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { animeEpisodeTable } from "@/database/schemas/myanimelist/anime/anime-episode-schema";
import { animeToCharacterTable } from "@/database/schemas/myanimelist/anime/anime-to-character-schema";
import { animeToGenreTable } from "@/database/schemas/myanimelist/anime/anime-to-genre-schema";
import { animeToProducersTable } from "@/database/schemas/myanimelist/anime/anime-to-producers-schema";

export type AnimeType =
	| "TV"
	| "Movie"
	| "OVA"
	| "Special"
	| "ONA"
	| "Music"
	| "CM"
	| "PV"
	| "TV Special"
	| null;
export type AnimeStatus =
	| "Finished Airing"
	| "Currently Airing"
	| "Not yet aired";
export type AnimeRating =
	| "G - All Ages"
	| "PG - Children"
	| "PG-13 - Teens 13 or older"
	| "R - 17+ (violence & profanity)"
	| "R+ - Mild Nudity"
	| "Rx - Hentai"
	| null;
export type AnimeSeason = "spring" | "summer" | "fall" | "winter" | null;

export type DaysOfTheWeek =
	| "Mondays"
	| "Tuesdays"
	| "Wednesdays"
	| "Thursdays"
	| "Fridays"
	| "Saturdays"
	| "Sundays"
	| null;

export const animeTable = pgTable("animes", {
	id: serial("id").primaryKey(),
	approved: boolean("approved").notNull().default(false),
	images: text("images").notNull(),
	trailer: text("trailer"),
	title: text("title").notNull(),
	titles: jsonb("titles").notNull().$type<Array<Record<string, string>>>(),
	titleEnglish: text("title_english"),
	titleJapanese: text("title_japanese"),
	titleSynonyms: jsonb("title_synonyms")
		.$type<string[]>()
		.default(sql`'[]'::jsonb`),
	type: varchar("type", { length: 10 }).$type<AnimeType>(),
	source: text("source"),
	numberEpisodes: integer("number_episodes"),
	status: varchar("status", { length: 16 }).$type<AnimeStatus>(),
	airing: boolean("airing").notNull().default(false),
	airedFrom: timestamp("aired_from", { mode: "string", withTimezone: false }),
	airedTo: timestamp("aired_to", { mode: "string", withTimezone: false }),
	duration: integer("duration"),
	rating: varchar("rating", { length: 32 }).$type<AnimeRating>(),
	synopsis: text("synopsis"),
	background: text("background"),
	season: varchar("season", { length: 6 }).$type<AnimeSeason>(),
	year: integer("year"),
	broadcastDay: varchar("broadcast_day", { length: 10 }).$type<DaysOfTheWeek>(),
	broadcastTime: varchar("broadcast_time", { length: 5 }),
	broadcastTimezone: varchar("broadcast_timezone", { length: 16 }),
	theme: jsonb("theme")
		.$type<Array<Record<string, string>>>()
		.default(sql`'[]'::jsonb`),
	external: jsonb("external")
		.$type<Array<Record<string, string>>>()
		.default(sql`'[]'::jsonb`),
});

export const animeRelations = relations(animeTable, ({ many }) => ({
	episodes: many(animeEpisodeTable),
	genres: many(animeToGenreTable),
	producers: many(animeToProducersTable),
	characters: many(animeToCharacterTable),
}));

export type Anime = typeof animeTable.$inferSelect;
export type NewAnime = typeof animeTable.$inferInsert;
