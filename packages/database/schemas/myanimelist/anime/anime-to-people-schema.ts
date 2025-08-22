import { relations } from "drizzle-orm";
import { integer, jsonb, pgTable, serial, unique } from "drizzle-orm/pg-core";
import { peopleTable } from "../people-schema";
import { animeTable } from "./anime-schema";

export const animeToPeopleTable = pgTable(
	"anime_to_people",
	{
		id: serial("id").primaryKey(),
		animeId: integer("anime_id")
			.notNull()
			.references(() => animeTable.id, { onDelete: "cascade" }),
		peopleId: integer("people_id")
			.notNull()
			.references(() => peopleTable.id, { onDelete: "cascade" }),
		positions: jsonb("positions").notNull().$type<string[]>(),
	},
	(table) => [unique().on(table.animeId, table.peopleId, table.positions)],
);

export const animeToPeopleRelations = relations(
	animeToPeopleTable,
	({ one }) => ({
		anime: one(animeTable, {
			fields: [animeToPeopleTable.animeId],
			references: [animeTable.id],
		}),
		people: one(peopleTable, {
			fields: [animeToPeopleTable.peopleId],
			references: [peopleTable.id],
		}),
	}),
);

export type AnimeToPeople = typeof animeToPeopleTable.$inferSelect;
export type NewAnimeToPeople = typeof animeToPeopleTable.$inferInsert;
