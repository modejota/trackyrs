import type { AnimeGenre, AnimeToGenre } from "@/schemas";
import type { AnimeEpisode } from "@/schemas/myanimelist/anime/anime-episode-schema";
import type { Anime } from "@/schemas/myanimelist/anime/anime-schema";
import type { AnimeToCharacter } from "@/schemas/myanimelist/anime/anime-to-character-schema";
import type { AnimeToPeople } from "@/schemas/myanimelist/anime/anime-to-people-schema";
import type { Character } from "@/schemas/myanimelist/character/character-schema";
import type { People } from "@/schemas/myanimelist/people-schema";

export interface CharacterWithRole extends AnimeToCharacter {
	character: Character;
}

export interface StaffWithRole extends AnimeToPeople {
	people: People;
}

export interface GenreWithInfo extends AnimeToGenre {
	genres: AnimeGenre;
}

export interface AnimeWithRelations {
	anime: Anime;
	episodes: AnimeEpisode[];
	characters: CharacterWithRole[];
	staff: StaffWithRole[];
	genres: GenreWithInfo[];
}
