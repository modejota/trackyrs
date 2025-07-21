import { jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const animeProducersTable = pgTable("anime_producers", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	titles: jsonb("titles").notNull().$type<Record<string, object>>(),
	images: text("images").notNull(),
	established: timestamp("established", {
		mode: "string",
		withTimezone: false,
	}),
	about: text("about"),
});

export type Producer = typeof animeProducersTable.$inferSelect;
export type NewProducer = typeof animeProducersTable.$inferInsert;
