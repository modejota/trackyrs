import { integer, jsonb, pgTable, serial } from "drizzle-orm/pg-core";
import { animeTable } from "@/schemas/myanimelist/anime/anime-schema";
import { peopleTable } from "@/schemas/myanimelist/people-schema";

export const animeToPeopleTable = pgTable("anime_to_people", {
	id: serial("id").primaryKey(),
	animeId: integer("anime_id")
		.notNull()
		.references(() => animeTable.id, { onDelete: "cascade" }),
	peopleId: integer("people_id")
		.notNull()
		.references(() => peopleTable.id, { onDelete: "cascade" }),
	positions: jsonb("positions").notNull().$type<string[]>(),
});
