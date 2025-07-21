import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { animeTable } from "@/database/schemas/myanimelist/anime/anime-schema";
import { mangaTable } from "@/database/schemas/myanimelist/manga/manga-schema";

export const animeMangaRelationTable = pgTable("anime_manga_relation", {
	id: serial("id").primaryKey(),
	animeSourceId: integer("anime_source_id").references(() => animeTable.id),
	mangaSourceId: integer("manga_source_id").references(() => mangaTable.id),
	animeDestinationId: integer("anime_destination_id").references(
		() => animeTable.id,
	),
	mangaDestinationId: integer("manga_destination_id").references(
		() => mangaTable.id,
	),
	type: varchar("type", { length: 32 }),
});
