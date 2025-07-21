CREATE TABLE "anime_episodes" (
	"id" serial PRIMARY KEY NOT NULL,
	"anime_id" integer NOT NULL,
	"episode_number" integer NOT NULL,
	"title" text NOT NULL,
	"title_japanese" text,
	"title_romaji" text,
	"aired" timestamp,
	"filler" boolean DEFAULT false NOT NULL,
	"recap" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "anime_genres" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "anime_producers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"titles" jsonb NOT NULL,
	"images" text NOT NULL,
	"established" timestamp,
	"about" text
);
--> statement-breakpoint
CREATE TABLE "animes" (
	"id" serial PRIMARY KEY NOT NULL,
	"approved" boolean DEFAULT false NOT NULL,
	"images" text NOT NULL,
	"trailer" text,
	"title" text NOT NULL,
	"titles" jsonb NOT NULL,
	"title_english" text,
	"title_japanese" text,
	"title_synonyms" jsonb DEFAULT '[]'::jsonb,
	"type" varchar(10),
	"source" text,
	"number_episodes" integer,
	"status" varchar(16),
	"airing" boolean DEFAULT false NOT NULL,
	"aired_from" timestamp,
	"aired_to" timestamp,
	"duration" integer,
	"rating" varchar(32),
	"synopsis" text,
	"background" text,
	"season" varchar(6),
	"year" integer,
	"broadcast_day" varchar(10),
	"broadcast_time" varchar(5),
	"broadcast_timezone" varchar(16),
	"theme" jsonb DEFAULT '[]'::jsonb,
	"external" jsonb DEFAULT '[]'::jsonb
);
--> statement-breakpoint
CREATE TABLE "anime_to_character" (
	"id" serial PRIMARY KEY NOT NULL,
	"anime_id" integer NOT NULL,
	"character_id" integer NOT NULL,
	"role" varchar(12) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "anime_to_genre" (
	"id" serial PRIMARY KEY NOT NULL,
	"anime_id" integer NOT NULL,
	"genre_id" integer NOT NULL,
	"role" varchar(16) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "anime_to_producers" (
	"id" serial PRIMARY KEY NOT NULL,
	"anime_id" integer NOT NULL,
	"producer_id" integer NOT NULL,
	"role" varchar(8) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "anime_manga_relation" (
	"id" serial PRIMARY KEY NOT NULL,
	"anime_source_id" integer,
	"manga_source_id" integer,
	"anime_destination_id" integer,
	"manga_destination_id" integer,
	"type" varchar(32)
);
--> statement-breakpoint
CREATE TABLE "characters" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_kanji" text,
	"images" text NOT NULL,
	"about" text,
	"nicknames" jsonb
);
--> statement-breakpoint
CREATE TABLE "manga_genres" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "magazines" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mangas" (
	"id" serial PRIMARY KEY NOT NULL,
	"approved" boolean DEFAULT false NOT NULL,
	"images" text NOT NULL,
	"title" text NOT NULL,
	"titles" jsonb NOT NULL,
	"title_english" text,
	"title_japanese" text,
	"title_synonyms" jsonb DEFAULT '[]'::jsonb,
	"type" varchar(12),
	"number_chapters" integer,
	"number_volumes" integer,
	"status" varchar(12),
	"publishing" boolean DEFAULT false NOT NULL,
	"publishing_from" timestamp with time zone,
	"publishing_to" timestamp with time zone,
	"synopsis" text,
	"background" text,
	"external" jsonb DEFAULT '[]'::jsonb
);
--> statement-breakpoint
CREATE TABLE "manga_to_genre" (
	"id" serial PRIMARY KEY NOT NULL,
	"manga_id" integer NOT NULL,
	"genre_id" integer NOT NULL,
	"role" varchar(16) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "manga_to_magazine" (
	"id" serial PRIMARY KEY NOT NULL,
	"manga_id" integer NOT NULL,
	"magazine_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "manga_to_people" (
	"id" serial PRIMARY KEY NOT NULL,
	"manga_id" integer NOT NULL,
	"people_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "people" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"given_name" text,
	"family_name" text,
	"alternate_names" jsonb DEFAULT '[]'::jsonb,
	"birthday" timestamp,
	"about" text,
	"images" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "anime_to_people" (
	"id" serial PRIMARY KEY NOT NULL,
	"anime_id" integer NOT NULL,
	"people_id" integer NOT NULL,
	"positions" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_to_people" (
	"id" serial PRIMARY KEY NOT NULL,
	"character_id" integer NOT NULL,
	"people_id" integer NOT NULL,
	"language" varchar(24) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "manga_to_character" (
	"id" serial PRIMARY KEY NOT NULL,
	"manga_id" integer NOT NULL,
	"character_id" integer NOT NULL,
	"role" varchar(12) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "anime_episodes" ADD CONSTRAINT "anime_episodes_anime_id_animes_id_fk" FOREIGN KEY ("anime_id") REFERENCES "public"."animes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anime_to_character" ADD CONSTRAINT "anime_to_character_anime_id_animes_id_fk" FOREIGN KEY ("anime_id") REFERENCES "public"."animes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anime_to_character" ADD CONSTRAINT "anime_to_character_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anime_to_genre" ADD CONSTRAINT "anime_to_genre_anime_id_animes_id_fk" FOREIGN KEY ("anime_id") REFERENCES "public"."animes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anime_to_genre" ADD CONSTRAINT "anime_to_genre_genre_id_anime_genres_id_fk" FOREIGN KEY ("genre_id") REFERENCES "public"."anime_genres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anime_to_producers" ADD CONSTRAINT "anime_to_producers_anime_id_animes_id_fk" FOREIGN KEY ("anime_id") REFERENCES "public"."animes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anime_to_producers" ADD CONSTRAINT "anime_to_producers_producer_id_anime_producers_id_fk" FOREIGN KEY ("producer_id") REFERENCES "public"."anime_producers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anime_manga_relation" ADD CONSTRAINT "anime_manga_relation_anime_source_id_animes_id_fk" FOREIGN KEY ("anime_source_id") REFERENCES "public"."animes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anime_manga_relation" ADD CONSTRAINT "anime_manga_relation_manga_source_id_mangas_id_fk" FOREIGN KEY ("manga_source_id") REFERENCES "public"."mangas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anime_manga_relation" ADD CONSTRAINT "anime_manga_relation_anime_destination_id_animes_id_fk" FOREIGN KEY ("anime_destination_id") REFERENCES "public"."animes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anime_manga_relation" ADD CONSTRAINT "anime_manga_relation_manga_destination_id_mangas_id_fk" FOREIGN KEY ("manga_destination_id") REFERENCES "public"."mangas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manga_to_genre" ADD CONSTRAINT "manga_to_genre_manga_id_mangas_id_fk" FOREIGN KEY ("manga_id") REFERENCES "public"."mangas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manga_to_genre" ADD CONSTRAINT "manga_to_genre_genre_id_manga_genres_id_fk" FOREIGN KEY ("genre_id") REFERENCES "public"."manga_genres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manga_to_magazine" ADD CONSTRAINT "manga_to_magazine_manga_id_mangas_id_fk" FOREIGN KEY ("manga_id") REFERENCES "public"."mangas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manga_to_magazine" ADD CONSTRAINT "manga_to_magazine_magazine_id_magazines_id_fk" FOREIGN KEY ("magazine_id") REFERENCES "public"."magazines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manga_to_people" ADD CONSTRAINT "manga_to_people_manga_id_mangas_id_fk" FOREIGN KEY ("manga_id") REFERENCES "public"."mangas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manga_to_people" ADD CONSTRAINT "manga_to_people_people_id_people_id_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anime_to_people" ADD CONSTRAINT "anime_to_people_anime_id_animes_id_fk" FOREIGN KEY ("anime_id") REFERENCES "public"."animes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anime_to_people" ADD CONSTRAINT "anime_to_people_people_id_people_id_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_to_people" ADD CONSTRAINT "character_to_people_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_to_people" ADD CONSTRAINT "character_to_people_people_id_people_id_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manga_to_character" ADD CONSTRAINT "manga_to_character_manga_id_mangas_id_fk" FOREIGN KEY ("manga_id") REFERENCES "public"."mangas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manga_to_character" ADD CONSTRAINT "manga_to_character_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;