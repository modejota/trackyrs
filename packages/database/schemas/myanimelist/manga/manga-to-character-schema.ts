import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { characterTable } from "@/schemas/myanimelist/character/character-schema";
import { mangaTable } from "@/schemas/myanimelist/manga/manga-schema";

export type CharacterRole = "Main" | "Supporting";

export const mangaToCharacterTable = pgTable("manga_to_character", {
	id: serial("id").primaryKey(),
	mangaId: integer("manga_id")
		.notNull()
		.references(() => mangaTable.id, { onDelete: "cascade" }),
	characterId: integer("character_id")
		.notNull()
		.references(() => characterTable.id, { onDelete: "cascade" }),
	role: varchar("role", { length: 12 }).notNull().$type<CharacterRole>(),
});
