import type { Anime } from "@trackyrs/database/schemas/myanimelist/anime/anime-schema";
import type { Character } from "@trackyrs/database/schemas/myanimelist/character/character-schema";
import type { Manga } from "@trackyrs/database/schemas/myanimelist/manga/manga-schema";
import type { People } from "@trackyrs/database/schemas/myanimelist/people-schema";

export interface UnifiedSearchEnvelope {
	success: boolean;
	data: {
		anime: Anime[];
		manga: Manga[];
		people: People[];
		characters: Character[];
	};
}
