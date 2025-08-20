CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX "idx_anime_title_gin" ON "animes" USING gin ("title" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "idx_anime_title_english_gin" ON "animes" USING gin ("title_english" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "idx_manga_title_gin" ON "mangas" USING gin ("title" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "idx_manga_title_english_gin" ON "mangas" USING gin ("title_english" gin_trgm_ops);