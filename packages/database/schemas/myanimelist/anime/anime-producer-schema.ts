import { integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import type { ProducerTitlesInfo } from "../../../types/anime-with-relations";

export const animeProducersTable = pgTable("anime_producers", {
	id: integer("id").primaryKey(),
	name: text("name").notNull(),
	titles: jsonb("titles").notNull().$type<Array<ProducerTitlesInfo>>(),
	images: text("images").notNull(),
	established: timestamp("established", {
		mode: "string",
		withTimezone: false,
	}),
	about: text("about"),
});

export type Producer = typeof animeProducersTable.$inferSelect;
export type NewProducer = typeof animeProducersTable.$inferInsert;
