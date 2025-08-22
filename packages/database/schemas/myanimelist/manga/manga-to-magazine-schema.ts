import { relations } from "drizzle-orm";
import { integer, pgTable, serial, unique } from "drizzle-orm/pg-core";
import { mangaMagazineTable } from "./manga-magazine-schema";
import { mangaTable } from "./manga-schema";

export const mangaToMagazineTable = pgTable(
	"manga_to_magazine",
	{
		id: serial("id").primaryKey(),
		mangaId: integer("manga_id")
			.notNull()
			.references(() => mangaTable.id, { onDelete: "cascade" }),
		magazineId: integer("magazine_id")
			.notNull()
			.references(() => mangaMagazineTable.id, { onDelete: "cascade" }),
	},
	(table) => [unique().on(table.mangaId, table.magazineId)],
);

export const mangaToMagazineRelations = relations(
	mangaToMagazineTable,
	({ one }) => ({
		manga: one(mangaTable, {
			fields: [mangaToMagazineTable.mangaId],
			references: [mangaTable.id],
		}),
		magazine: one(mangaMagazineTable, {
			fields: [mangaToMagazineTable.magazineId],
			references: [mangaMagazineTable.id],
		}),
	}),
);

export type MangaToMagazine = typeof mangaToMagazineTable.$inferSelect;
export type NewMangaToMagazine = typeof mangaToMagazineTable.$inferInsert;
