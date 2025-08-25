CREATE TABLE "user_tracks_manga" (
	"id" serial PRIMARY KEY NOT NULL,
	"manga_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"score" real,
	"chapters_read" smallint,
	"volumes_read" smallint,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"status" varchar(16),
	"rereads" integer
);
--> statement-breakpoint
ALTER TABLE "user_tracks_anime" ALTER COLUMN "start_date" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_tracks_anime" ALTER COLUMN "end_date" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_tracks_manga" ADD CONSTRAINT "user_tracks_manga_manga_id_mangas_id_fk" FOREIGN KEY ("manga_id") REFERENCES "public"."mangas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tracks_manga" ADD CONSTRAINT "user_tracks_manga_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "manga_user_idx" ON "user_tracks_manga" USING btree ("manga_id","user_id");