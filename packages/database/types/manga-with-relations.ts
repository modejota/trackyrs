import type { Character } from "../schemas/myanimelist/character/character-schema";
import type { MangaGenre } from "../schemas/myanimelist/manga/manga-genre-schema";
import type { Manga } from "../schemas/myanimelist/manga/manga-schema";
import type { MangaToCharacter } from "../schemas/myanimelist/manga/manga-to-character-schema";
import type { MangaToGenre } from "../schemas/myanimelist/manga/manga-to-genre-schema";
import type { MangaToMagazine } from "../schemas/myanimelist/manga/manga-to-magazine-schema";
import type { MangaToPeople } from "../schemas/myanimelist/manga/manga-to-people-schema";
import type { People } from "../schemas/myanimelist/people-schema";

export enum MangaType {
	MANGA = "Manga",
	NOVEL = "Novel",
	LIGHT_NOVEL = "Light Novel",
	ONE_SHOT = "One-shot",
	DOUJINSHI = "Doujinshi",
	MANHWA = "Manhwa",
	MANHUA = "Manhua",
}

export enum MangaStatus {
	FINISHED = "Finished",
	PUBLISHING = "Publishing",
	ON_HIATUS = "On Hiatus",
	DISCONTINUED = "Discontinued",
	NOT_YET_PUBLISHED = "Not yet published",
}

export enum MangaGenreRole {
	GENRES = "Genres",
	EXPLICIT_GENRES = "Explicit Genres",
	THEMES = "Themes",
	DEMOGRAPHICS = "Demographics",
}

export type MangaCharacterRole = "Main" | "Supporting";

export interface TitleInfo {
	type: string;
	title: string;
}

export interface CharacterWithRole extends MangaToCharacter {
	character: Character;
}

export interface StaffWithRole extends MangaToPeople {
	people: People;
}

export interface GenreWithInfo extends MangaToGenre {
	genres: MangaGenre;
}

export interface MagazineWithManga extends MangaToMagazine {
	magazine: MangaToMagazine;
}

export interface MangaWithRelations {
	manga: Manga;
	genres: GenreWithInfo[];
	magazines: MagazineWithManga[];
	characters: CharacterWithRole[];
	staff: StaffWithRole[];
}
