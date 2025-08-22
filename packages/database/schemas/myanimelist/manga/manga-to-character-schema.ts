import { relations } from "drizzle-orm";
import { integer, pgTable, serial, unique, varchar } from "drizzle-orm/pg-core";
import type { MangaCharacterRole } from "../../../types/manga-with-relations";
import { characterTable } from "../character/character-schema";
import { mangaTable } from "./manga-schema";

export const mangaToCharacterTable = pgTable(
	"manga_to_character",
	{
		id: serial("id").primaryKey(),
		mangaId: integer("manga_id")
			.notNull()
			.references(() => mangaTable.id, { onDelete: "cascade" }),
		characterId: integer("character_id")
			.notNull()
			.references(() => characterTable.id, { onDelete: "cascade" }),
		role: varchar("role", { length: 12 }).notNull().$type<MangaCharacterRole>(),
	},
	(table) => [unique().on(table.mangaId, table.characterId, table.role)],
);

export const mangaToCharacterRelations = relations(
	mangaToCharacterTable,
	({ one }) => ({
		manga: one(mangaTable, {
			fields: [mangaToCharacterTable.mangaId],
			references: [mangaTable.id],
		}),
		character: one(characterTable, {
			fields: [mangaToCharacterTable.characterId],
			references: [characterTable.id],
		}),
	}),
);

export type MangaToCharacter = typeof mangaToCharacterTable.$inferSelect;
export type NewMangaToCharacter = typeof mangaToCharacterTable.$inferInsert;
