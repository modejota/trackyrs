ALTER TABLE "animes" ADD COLUMN "reference_score" real DEFAULT 0;--> statement-breakpoint
ALTER TABLE "animes" ADD COLUMN "reference_scored_by" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "mangas" ADD COLUMN "reference_score" real DEFAULT 0;--> statement-breakpoint
ALTER TABLE "mangas" ADD COLUMN "reference_scored_by" integer DEFAULT 0;