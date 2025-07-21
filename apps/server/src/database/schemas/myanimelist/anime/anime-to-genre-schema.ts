import { relations } from "drizzle-orm";
import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { animeGenreTable } from "@/database/schemas/myanimelist/anime/anime-genre-schema";
import { animeTable } from "@/database/schemas/myanimelist/anime/anime-schema";

export type AnimeGenreRole =
	| "Genres"
	| "Explicit Genres"
	| "Themes"
	| "Demographics";

export const animeToGenreTable = pgTable("anime_to_genre", {
	id: serial("id").primaryKey(),
	animeId: integer("anime_id")
		.notNull()
		.references(() => animeTable.id, { onDelete: "cascade" }),
	genreId: integer("genre_id")
		.notNull()
		.references(() => animeGenreTable.id, { onDelete: "cascade" }),
	role: varchar("role", { length: 16 }).notNull().$type<AnimeGenreRole>(),
});

export const animeToGenreRelations = relations(
	animeToGenreTable,
	({ one }) => ({
		anime: one(animeTable, {
			fields: [animeToGenreTable.animeId],
			references: [animeTable.id],
		}),
		genre: one(animeGenreTable, {
			fields: [animeToGenreTable.genreId],
			references: [animeGenreTable.id],
		}),
	}),
);
