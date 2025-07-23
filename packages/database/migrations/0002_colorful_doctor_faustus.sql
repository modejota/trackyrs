ALTER TABLE "animes" ALTER COLUMN "type" SET DATA TYPE varchar(16);--> statement-breakpoint
ALTER TABLE "animes" ALTER COLUMN "status" SET DATA TYPE varchar(32);--> statement-breakpoint
ALTER TABLE "animes" ALTER COLUMN "season" SET DATA TYPE varchar(8);--> statement-breakpoint
ALTER TABLE "anime_to_character" ADD CONSTRAINT "anime_to_character_anime_id_character_id_role_unique" UNIQUE("anime_id","character_id","role");--> statement-breakpoint
ALTER TABLE "anime_to_genre" ADD CONSTRAINT "anime_to_genre_anime_id_genre_id_role_unique" UNIQUE("anime_id","genre_id","role");--> statement-breakpoint
ALTER TABLE "anime_to_producers" ADD CONSTRAINT "anime_to_producers_anime_id_producer_id_role_unique" UNIQUE("anime_id","producer_id","role");--> statement-breakpoint
ALTER TABLE "anime_manga_relation" ADD CONSTRAINT "anime_manga_relations_unique" UNIQUE("anime_source_id","manga_source_id","anime_destination_id","manga_destination_id","type");--> statement-breakpoint
ALTER TABLE "manga_to_genre" ADD CONSTRAINT "manga_to_genre_manga_id_genre_id_role_unique" UNIQUE("manga_id","genre_id","role");--> statement-breakpoint
ALTER TABLE "manga_to_magazine" ADD CONSTRAINT "manga_to_magazine_manga_id_magazine_id_unique" UNIQUE("manga_id","magazine_id");--> statement-breakpoint
ALTER TABLE "manga_to_people" ADD CONSTRAINT "manga_to_people_manga_id_people_id_unique" UNIQUE("manga_id","people_id");--> statement-breakpoint
ALTER TABLE "anime_to_people" ADD CONSTRAINT "anime_to_people_anime_id_people_id_positions_unique" UNIQUE("anime_id","people_id","positions");--> statement-breakpoint
ALTER TABLE "manga_to_character" ADD CONSTRAINT "manga_to_character_manga_id_character_id_role_unique" UNIQUE("manga_id","character_id","role");