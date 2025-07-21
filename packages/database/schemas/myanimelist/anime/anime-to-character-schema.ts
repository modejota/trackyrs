import { relations } from "drizzle-orm";
import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { animeTable } from "@/schemas/myanimelist/anime/anime-schema";
import { characterTable } from "@/schemas/myanimelist/character/character-schema";

export type CharacterRole = "Main" | "Supporting";

export const animeToCharacterTable = pgTable("anime_to_character", {
	id: serial("id").primaryKey(),
	animeId: integer("anime_id")
		.notNull()
		.references(() => animeTable.id, { onDelete: "cascade" }),
	characterId: integer("character_id")
		.notNull()
		.references(() => characterTable.id, { onDelete: "cascade" }),
	role: varchar("role", { length: 12 }).notNull().$type<CharacterRole>(),
});

export const animeToCharacterRelations = relations(
	animeToCharacterTable,
	({ one }) => ({
		anime: one(animeTable, {
			fields: [animeToCharacterTable.animeId],
			references: [animeTable.id],
		}),
		character: one(characterTable, {
			fields: [animeToCharacterTable.characterId],
			references: [characterTable.id],
		}),
	}),
);
