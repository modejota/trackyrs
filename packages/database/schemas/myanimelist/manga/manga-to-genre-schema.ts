import { integer, pgTable, serial, unique, varchar } from "drizzle-orm/pg-core";
import { mangaGenreTable } from "@/schemas/myanimelist/manga/manga-genre-schema";
import { mangaTable } from "@/schemas/myanimelist/manga/manga-schema";

export enum MangaGenreRole {
	GENRES = "Genres",
	EXPLICIT_GENRES = "Explicit Genres",
	THEMES = "Themes",
	DEMOGRAPHICS = "Demographics",
}

export const mangaToGenreTable = pgTable(
	"manga_to_genre",
	{
		id: serial("id").primaryKey(),
		mangaId: integer("manga_id")
			.notNull()
			.references(() => mangaTable.id, { onDelete: "cascade" }),
		genreId: integer("genre_id")
			.notNull()
			.references(() => mangaGenreTable.id, { onDelete: "cascade" }),
		role: varchar("role", { length: 16 }).notNull(),
	},
	(table) => [unique().on(table.mangaId, table.genreId, table.role)],
);

export type MangaToGenre = typeof mangaToGenreTable.$inferSelect;
export type NewMangaToGenre = typeof mangaToGenreTable.$inferInsert;
