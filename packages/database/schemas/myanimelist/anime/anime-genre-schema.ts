import { integer, pgTable, text } from "drizzle-orm/pg-core";

export const animeGenreTable = pgTable("anime_genres", {
	id: integer("id").primaryKey(),
	name: text("name").notNull(),
});

export type AnimeGenre = typeof animeGenreTable.$inferSelect;
export type NewAnimeGenre = typeof animeGenreTable.$inferInsert;
