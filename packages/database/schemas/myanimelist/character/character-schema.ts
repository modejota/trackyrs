import { integer, jsonb, pgTable, text } from "drizzle-orm/pg-core";

export const characterTable = pgTable("characters", {
	id: integer("id").primaryKey(),
	name: text("name").notNull(),
	nameKanji: text("name_kanji"),
	images: text("images").notNull(),
	about: text("about"),
	nicknames: jsonb("nicknames").$type<string[]>(),
});

export type Character = typeof characterTable.$inferSelect;
export type NewCharacter = typeof characterTable.$inferInsert;
