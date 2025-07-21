import { relations } from "drizzle-orm";
import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { animeGenreTable } from "@/schemas/myanimelist/anime/anime-genre-schema";
import { animeTable } from "@/schemas/myanimelist/anime/anime-schema";

export enum AnimeGenreRole {
	GENRES = "Genres",
	EXPLICIT_GENRES = "Explicit Genres",
	THEMES = "Themes",
	DEMOGRAPHICS = "Demographics",
}

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

export interface AnimeToGenre {
	id: number;
	animeId: number;
	genreId: number;
	role: AnimeGenreRole;
}

export interface NewAnimeToGenre {
	animeId: number;
	genreId: number;
	role: AnimeGenreRole;
}
