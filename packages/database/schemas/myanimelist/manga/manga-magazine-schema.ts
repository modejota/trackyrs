import { integer, pgTable, text } from "drizzle-orm/pg-core";

export const mangaMagazineTable = pgTable("magazines", {
	id: integer("id").primaryKey(),
	name: text("name").notNull(),
});

export type Magazine = typeof mangaMagazineTable.$inferSelect;
export type NewMagazine = typeof mangaMagazineTable.$inferInsert;
