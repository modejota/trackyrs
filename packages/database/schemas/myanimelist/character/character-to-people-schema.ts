import { integer, pgTable, serial, unique, varchar } from "drizzle-orm/pg-core";
import { peopleTable } from "../people-schema";
import { characterTable } from "./character-schema";

export const characterToPeopleTable = pgTable(
	"character_to_people",
	{
		id: serial("id").primaryKey(),
		characterId: integer("character_id")
			.notNull()
			.references(() => characterTable.id, { onDelete: "cascade" }),
		peopleId: integer("people_id")
			.notNull()
			.references(() => peopleTable.id, { onDelete: "cascade" }),
		language: varchar("language", { length: 24 }).notNull(),
	},
	(table) => [unique().on(table.characterId, table.peopleId, table.language)],
);

export type CharacterToPeople = typeof characterToPeopleTable.$inferSelect;
export type NewCharacterToPeople = typeof characterToPeopleTable.$inferInsert;
