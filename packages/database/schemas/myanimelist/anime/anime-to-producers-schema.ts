import { relations } from "drizzle-orm";
import { integer, pgTable, serial, unique, varchar } from "drizzle-orm/pg-core";
import type { AnimeProducerRole } from "../../../types/anime-with-relations";
import { animeProducersTable } from "./anime-producer-schema";
import { animeTable } from "./anime-schema";

export const animeToProducersTable = pgTable(
	"anime_to_producers",
	{
		id: serial("id").primaryKey(),
		animeId: integer("anime_id")
			.notNull()
			.references(() => animeTable.id, { onDelete: "cascade" }),
		producerId: integer("producer_id")
			.notNull()
			.references(() => animeProducersTable.id, { onDelete: "cascade" }),
		role: varchar("role", { length: 8 }).$type<AnimeProducerRole>().notNull(),
	},
	(table) => [unique().on(table.animeId, table.producerId, table.role)],
);

export const animeToProducersRelations = relations(
	animeToProducersTable,
	({ one }) => ({
		anime: one(animeTable, {
			fields: [animeToProducersTable.animeId],
			references: [animeTable.id],
		}),
		producer: one(animeProducersTable, {
			fields: [animeToProducersTable.producerId],
			references: [animeProducersTable.id],
		}),
	}),
);

export type AnimeToProducers = typeof animeToProducersTable.$inferSelect;
export type NewAnimeToProducers = typeof animeToProducersTable.$inferInsert;
