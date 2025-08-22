import { relations } from "drizzle-orm";
import { integer, pgTable, serial, unique } from "drizzle-orm/pg-core";
import { peopleTable } from "../people-schema";
import { mangaTable } from "./manga-schema";

export const mangaToPeopleTable = pgTable(
	"manga_to_people",
	{
		id: serial("id").primaryKey(),
		mangaId: integer("manga_id")
			.notNull()
			.references(() => mangaTable.id),
		peopleId: integer("people_id")
			.notNull()
			.references(() => peopleTable.id),
	},
	(table) => [unique().on(table.mangaId, table.peopleId)],
);

export const mangaToPeopleRelations = relations(
	mangaToPeopleTable,
	({ one }) => ({
		manga: one(mangaTable, {
			fields: [mangaToPeopleTable.mangaId],
			references: [mangaTable.id],
		}),
		people: one(peopleTable, {
			fields: [mangaToPeopleTable.peopleId],
			references: [peopleTable.id],
		}),
	}),
);

export type MangaToPeople = typeof mangaToPeopleTable.$inferSelect;
export type NewMangaToPeople = typeof mangaToPeopleTable.$inferInsert;
