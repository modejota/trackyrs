import { relations } from "drizzle-orm";
import {
	boolean,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { animeTable } from "@/database/schemas/myanimelist/anime/anime-schema";

export const animeEpisodeTable = pgTable("anime_episodes", {
	id: serial("id").primaryKey(),
	animeId: integer("anime_id")
		.notNull()
		.references(() => animeTable.id, { onDelete: "cascade" }),
	episodeNumber: integer("episode_number").notNull(),
	title: text("title").notNull(),
	titleJapanese: text("title_japanese"),
	titleRomaji: text("title_romaji"),
	aired: timestamp("aired", { mode: "string", withTimezone: false }),
	filler: boolean("filler").notNull().default(false),
	recap: boolean("recap").notNull().default(false),
});

export const animeEpisodeRelations = relations(
	animeEpisodeTable,
	({ one }) => ({
		anime: one(animeTable, {
			fields: [animeEpisodeTable.animeId],
			references: [animeTable.id],
		}),
	}),
);

export type AnimeEpisode = typeof animeEpisodeTable.$inferSelect;
export type NewAnimeEpisode = typeof animeEpisodeTable.$inferInsert;
