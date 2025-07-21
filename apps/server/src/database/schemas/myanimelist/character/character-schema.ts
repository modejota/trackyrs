import { jsonb, pgTable, serial, text } from "drizzle-orm/pg-core";

export const characterTable = pgTable("characters", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	nameKanji: text("name_kanji"),
	images: text("images").notNull(),
	about: text("about"),
	nicknames: jsonb("nicknames").$type<string[]>(),
});

export type Character = typeof characterTable.$inferSelect;
export type NewCharacter = typeof characterTable.$inferInsert;
