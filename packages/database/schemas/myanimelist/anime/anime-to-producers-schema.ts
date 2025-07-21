import { relations } from "drizzle-orm";
import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { animeProducersTable } from "@/schemas/myanimelist/anime/anime-producer-schema";
import { animeTable } from "@/schemas/myanimelist/anime/anime-schema";

export enum AnimeProducerRole {
	PRODUCER = "Producer",
	LICENSOR = "Licensor",
	STUDIO = "Studio",
}

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

export interface AnimeToProducers {
	id: number;
	animeId: number;
	producerId: number;
	role: AnimeProducerRole;
}

export interface NewAnimeToProducers {
	animeId: number;
	producerId: number;
	role: AnimeProducerRole;
}
