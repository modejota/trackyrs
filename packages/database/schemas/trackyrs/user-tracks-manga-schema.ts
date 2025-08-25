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
import { mangaTable } from "../myanimelist/manga/manga-schema";

export const userTracksMangaTable = pgTable(
	"user_tracks_manga",
	{
		id: serial("id").primaryKey(),
		mangaId: integer("manga_id")
			.notNull()
			.references(() => mangaTable.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => userTable.id, { onDelete: "cascade" }),
		score: real("score"),
		chaptersRead: smallint("chapters_read"),
		volumesRead: smallint("volumes_read"),
		startDate: timestamp("start_date", { mode: "string", withTimezone: true }),
		endDate: timestamp("end_date", { mode: "string", withTimezone: true }),
		status: varchar("status", { length: 16 }),
		rereads: integer("rereads"),
	},
	(table) => ({
		mangaUserIdx: index("manga_user_idx").on(table.mangaId, table.userId),
	}),
);

export const userToMangaTracksRelations = relations(
	userTracksMangaTable,
	({ one }) => ({
		manga: one(mangaTable, {
			fields: [userTracksMangaTable.mangaId],
			references: [mangaTable.id],
		}),
		user: one(userTable, {
			fields: [userTracksMangaTable.userId],
			references: [userTable.id],
		}),
	}),
);

export type UserTracksManga = typeof userTracksMangaTable.$inferSelect;
export type NewUserTracksManga = typeof userTracksMangaTable.$inferInsert;
