import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { mangaGenreTable } from "@/database/schemas/myanimelist/manga/manga-genre-schema";
import { mangaTable } from "@/database/schemas/myanimelist/manga/manga-schema";

export type MangaGenreRole =
	| "Genres"
	| "Explicit Genres"
	| "Themes"
	| "Demographics";

export const mangaToGenreTable = pgTable("manga_to_genre", {
	id: serial("id").primaryKey(),
	mangaId: integer("manga_id")
		.notNull()
		.references(() => mangaTable.id, { onDelete: "cascade" }),
	genreId: integer("genre_id")
		.notNull()
		.references(() => mangaGenreTable.id, { onDelete: "cascade" }),
	role: varchar("role", { length: 16 }).notNull(),
});
