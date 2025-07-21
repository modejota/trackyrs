import { integer, pgTable, serial } from "drizzle-orm/pg-core";
import { mangaTable } from "@/database/schemas/myanimelist/manga/manga-schema";
import { peopleTable } from "@/database/schemas/myanimelist/people-schema";

export const mangaToPeopleTable = pgTable("manga_to_people", {
	id: serial("id").primaryKey(),
	mangaId: integer("manga_id")
		.notNull()
		.references(() => mangaTable.id),
	peopleId: integer("people_id")
		.notNull()
		.references(() => peopleTable.id),
});
