import { sql } from "drizzle-orm";
import { index, integer, jsonb, pgTable, text } from "drizzle-orm/pg-core";

export const characterTable = pgTable(
	"characters",
	{
		id: integer("id").primaryKey(),
		name: text("name").notNull(),
		nameKanji: text("name_kanji"),
		images: text("images").notNull(),
		about: text("about"),
		nicknames: jsonb("nicknames").$type<string[]>(),
		referenceFavorites: integer("reference_favorites").default(0),
	},
	(table) => ({
		nameGinIdx: index("idx_character_name_gin").using(
			"gin",
			sql`${table.name} gin_trgm_ops`,
		),
	}),
);

export type Character = typeof characterTable.$inferSelect;
export type NewCharacter = typeof characterTable.$inferInsert;
