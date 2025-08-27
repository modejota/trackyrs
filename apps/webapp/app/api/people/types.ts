import type { Anime } from "@trackyrs/database/schemas/myanimelist/anime/anime-schema";
import type { Character } from "@trackyrs/database/schemas/myanimelist/character/character-schema";
import type { Manga } from "@trackyrs/database/schemas/myanimelist/manga/manga-schema";
import type { People } from "@trackyrs/database/schemas/myanimelist/people-schema";

export interface PeopleWithRelations {
	people: People;
	animeStaff: { anime: Anime; positions: string[] }[];
	mangaStaff: { manga: Manga }[];
	voiceActing: { character: Character; language: string }[];
}

export interface PeopleSearchEnvelope {
	success: boolean;
	data: {
		people: People[];
		page: number;
		limit: number;
		total: number;
		hasMore: boolean;
	};
}
