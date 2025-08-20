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
import { animeEpisodeTable } from "@/schemas/myanimelist/anime/anime-episode-schema";
import { animeToCharacterTable } from "@/schemas/myanimelist/anime/anime-to-character-schema";
import { animeToGenreTable } from "@/schemas/myanimelist/anime/anime-to-genre-schema";
import { animeToPeopleTable } from "@/schemas/myanimelist/anime/anime-to-people-schema";
import { animeToProducersTable } from "@/schemas/myanimelist/anime/anime-to-producers-schema";
import type {
	AnimeExternalLink,
	AnimeStatusNullable,
	AnimeStreamingInfo,
	AnimeThemeInfo,
	AnimeTitleInfo,
	AnimeTypeNullable,
	DaysOfWeekNullable,
	RatingNullable,
	SeasonNullable,
} from "@/types/anime-with-relations";

export const animeTable = pgTable(
	"animes",
	{
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
		referenceScore: real("reference_score").default(0),
		referenceScoredBy: integer("reference_scored_by").default(0),
	},
	(table) => ({
		titleGinIdx: index("idx_anime_title_gin").using(
			"gin",
			sql`${table.title} gin_trgm_ops`,
		),
		titleEnglishGinIdx: index("idx_anime_title_english_gin").using(
			"gin",
			sql`${table.titleEnglish} gin_trgm_ops`,
		),
	}),
);

export const animeRelations = relations(animeTable, ({ many }) => ({
	episodes: many(animeEpisodeTable),
	genres: many(animeToGenreTable),
	producers: many(animeToProducersTable),
	characters: many(animeToCharacterTable),
	staff: many(animeToPeopleTable),
}));

export type Anime = typeof animeTable.$inferSelect;
export type NewAnime = typeof animeTable.$inferInsert;
