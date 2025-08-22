import { integer, pgTable, serial, unique, varchar } from "drizzle-orm/pg-core";
import { animeTable } from "./anime/anime-schema";
import { mangaTable } from "./manga/manga-schema";

export const animeMangaRelationTable = pgTable(
	"anime_manga_relation",
	{
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
	},
	(table) => [
		unique("anime_manga_relations_unique").on(
			table.animeSourceId,
			table.mangaSourceId,
			table.animeDestinationId,
			table.mangaDestinationId,
			table.type,
		),
	],
);

export type AnimeMangaRelation = typeof animeMangaRelationTable.$inferSelect;
export type NewAnimeMangaRelation = typeof animeMangaRelationTable.$inferInsert;
