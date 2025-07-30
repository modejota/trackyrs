import { sql } from "drizzle-orm";
import { integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const peopleTable = pgTable("people", {
	id: integer("id").primaryKey(),
	name: text("name").notNull(),
	givenName: text("given_name"),
	familyName: text("family_name"),
	alternateNames: jsonb("alternate_names")
		.$type<string[]>()
		.default(sql`'[]'::jsonb`),
	birthday: timestamp("birthday", { mode: "string", withTimezone: false }),
	about: text("about"),
	images: text("images").notNull(),
});

export type People = typeof peopleTable.$inferSelect;
export type NewPeople = typeof peopleTable.$inferInsert;
