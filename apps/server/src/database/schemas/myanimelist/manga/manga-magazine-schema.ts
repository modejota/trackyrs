import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";

export const mangaMagazineTable = pgTable("magazines", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
});

export type Magazine = typeof mangaMagazineTable.$inferSelect;
export type NewMagazine = typeof mangaMagazineTable.$inferInsert;
