import { sql } from "drizzle-orm";
import {
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const peopleTable = pgTable(
	"people",
	{
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
	},
	(table) => ({
		nameGinIdx: index("idx_people_name_gin").using(
			"gin",
			sql`${table.name} gin_trgm_ops`,
		),
	}),
);

export type People = typeof peopleTable.$inferSelect;
export type NewPeople = typeof peopleTable.$inferInsert;
