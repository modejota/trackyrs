import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";

export const animeGenreTable = pgTable("anime_genres", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
});

export type AnimeGenre = typeof animeGenreTable.$inferSelect;
export type NewAnimeGenre = typeof animeGenreTable.$inferInsert;
