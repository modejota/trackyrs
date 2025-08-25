CREATE TABLE "user_tracks_anime" (
	"id" serial PRIMARY KEY NOT NULL,
	"anime_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"score" real,
	"episodes_watched" smallint,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"status" varchar(16),
	"rewatches" integer
);
--> statement-breakpoint
ALTER TABLE "user_tracks_anime" ADD CONSTRAINT "user_tracks_anime_anime_id_animes_id_fk" FOREIGN KEY ("anime_id") REFERENCES "public"."animes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tracks_anime" ADD CONSTRAINT "user_tracks_anime_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "anime_user_idx" ON "user_tracks_anime" USING btree ("anime_id","user_id");