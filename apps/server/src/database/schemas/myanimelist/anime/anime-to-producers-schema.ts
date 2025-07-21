import { relations } from "drizzle-orm";
import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { animeProducersTable } from "@/database/schemas/myanimelist/anime/anime-producer-schema";
import { animeTable } from "@/database/schemas/myanimelist/anime/anime-schema";

export type AnimeProducerRole = "Producer" | "Licensor" | "Studio";

export const animeToProducersTable = pgTable("anime_to_producers", {
	id: serial("id").primaryKey(),
	animeId: integer("anime_id")
		.notNull()
		.references(() => animeTable.id, { onDelete: "cascade" }),
	producerId: integer("producer_id")
		.notNull()
		.references(() => animeProducersTable.id, { onDelete: "cascade" }),
	role: varchar("role", { length: 8 }).$type<AnimeProducerRole>().notNull(),
});

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

export type AnimeProducer = typeof animeToProducersTable.$inferSelect;
export type NewAnimeProducer = typeof animeToProducersTable.$inferInsert;
