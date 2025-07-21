import { integer, pgTable, serial } from "drizzle-orm/pg-core";
import { mangaMagazineTable } from "@/database/schemas/myanimelist/manga/manga-magazine-schema";
import { mangaTable } from "@/database/schemas/myanimelist/manga/manga-schema";

export const mangaToMagazineTable = pgTable("manga_to_magazine", {
	id: serial("id").primaryKey(),
	mangaId: integer("manga_id")
		.notNull()
		.references(() => mangaTable.id, { onDelete: "cascade" }),
	magazineId: integer("magazine_id")
		.notNull()
		.references(() => mangaMagazineTable.id, { onDelete: "cascade" }),
});
