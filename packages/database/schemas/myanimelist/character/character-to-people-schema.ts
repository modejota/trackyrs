import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { characterTable } from "@/schemas/myanimelist/character/character-schema";
import { peopleTable } from "@/schemas/myanimelist/people-schema";

export const characterToPeopleTable = pgTable("character_to_people", {
	id: serial("id").primaryKey(),
	characterId: integer("character_id")
		.notNull()
		.references(() => characterTable.id, { onDelete: "cascade" }),
	peopleId: integer("people_id")
		.notNull()
		.references(() => peopleTable.id, { onDelete: "cascade" }),
	language: varchar("language", { length: 24 }).notNull(),
});

export interface CharacterToPeople {
	id: number;
	characterId: number;
	peopleId: number;
	language: string;
}

export interface NewCharacterToPeople {
	characterId: number;
	personId: number;
	language: string;
}
