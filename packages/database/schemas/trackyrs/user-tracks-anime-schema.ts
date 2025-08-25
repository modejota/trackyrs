import { relations } from "drizzle-orm";
import {
	index,
	integer,
	pgTable,
	real,
	serial,
	smallint,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

import { user as userTable } from "../auth-schema";
import { animeTable } from "../myanimelist/anime/anime-schema";

export const userTracksAnimeTable = pgTable(
	"user_tracks_anime",
	{
		id: serial("id").primaryKey(),
		animeId: integer("anime_id")
			.notNull()
			.references(() => animeTable.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => userTable.id, { onDelete: "cascade" }),
		score: real("score"),
		episodesWatched: smallint("episodes_watched"),
		startDate: timestamp("start_date", { mode: "string", withTimezone: true }),
		endDate: timestamp("end_date", { mode: "string", withTimezone: true }),
		status: varchar("status", { length: 16 }),
		rewatches: integer("rewatches"),
	},
	(table) => ({
		animeUserIdx: index("anime_user_idx").on(table.animeId, table.userId),
	}),
);

export const userToAnimeTracksRelations = relations(
	userTracksAnimeTable,
	({ one }) => ({
		anime: one(animeTable, {
			fields: [userTracksAnimeTable.animeId],
			references: [animeTable.id],
		}),
		user: one(userTable, {
			fields: [userTracksAnimeTable.userId],
			references: [userTable.id],
		}),
	}),
);

export type UserTracksAnime = typeof userTracksAnimeTable.$inferSelect;
export type NewUserTracksAnime = typeof userTracksAnimeTable.$inferInsert;
