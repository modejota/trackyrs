import type { Anime } from "@trackyrs/database/schemas/myanimelist/anime/anime-schema";
import type { Character } from "@trackyrs/database/schemas/myanimelist/character/character-schema";
import type { Manga } from "@trackyrs/database/schemas/myanimelist/manga/manga-schema";
import type { People } from "@trackyrs/database/schemas/myanimelist/people-schema";
import type { AnimeCharacterRole } from "@trackyrs/database/types/anime-with-relations";
import type { MangaCharacterRole } from "@trackyrs/database/types/manga-with-relations";

export interface CharacterWithRelations {
	character: Character;
	voiceActors: VoiceActorWithLanguage[];
	animeAppearances: AnimeAppearance[];
	mangaAppearances: MangaAppearance[];
}

export interface VoiceActorWithLanguage {
	people: People;
	language: string;
}

export interface AnimeAppearance {
	anime: Anime;
	role: AnimeCharacterRole;
}

export interface MangaAppearance {
	manga: Manga;
	role: MangaCharacterRole;
}

export interface CharacterSearchEnvelope {
	success: boolean;
	data: {
		characters: Character[];
		page: number;
		limit: number;
		total: number;
		hasMore: boolean;
	};
}
