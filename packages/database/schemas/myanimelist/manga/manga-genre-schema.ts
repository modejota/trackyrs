import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const mangaGenreTable = pgTable("manga_genres", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
});

export type MangaGenre = typeof mangaGenreTable.$inferSelect;
export type NewMangaGenre = typeof mangaGenreTable.$inferInsert;
