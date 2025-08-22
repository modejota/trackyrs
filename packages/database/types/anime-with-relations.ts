import type { AnimeGenre, AnimeToGenre } from "../schemas";
import type { AnimeEpisode } from "../schemas/myanimelist/anime/anime-episode-schema";
import type { Anime } from "../schemas/myanimelist/anime/anime-schema";
import type { AnimeToCharacter } from "../schemas/myanimelist/anime/anime-to-character-schema";
import type { AnimeToPeople } from "../schemas/myanimelist/anime/anime-to-people-schema";
import type { Character } from "../schemas/myanimelist/character/character-schema";
import type { People } from "../schemas/myanimelist/people-schema";

export enum AnimeType {
	TV = "TV",
	OVA = "OVA",
	MOVIE = "Movie",
	SPECIAL = "Special",
	ONA = "ONA",
	MUSIC = "Music",
	CM = "CM",
	PV = "PV",
	TV_SPECIAL = "TV Special",
}

export type AnimeTypeNullable = AnimeType | null;

export enum AnimeStatus {
	FINISHED_AIRING = "Finished Airing",
	CURRENTLY_AIRING = "Currently Airing",
	NOT_YET_AIRED = "Not yet aired",
}

export type AnimeStatusNullable = AnimeStatus | null;

export enum Rating {
	G = "G - All Ages",
	PG = "PG - Children",
	PG_13 = "PG-13 - Teens 13 or older",
	R_17 = "R - 17+ (violence & profanity)",
	R_PLUS = "R+ - Mild Nudity",
	RX = "Rx - Hentai",
}

export type RatingNullable = Rating | null;

export enum Season {
	WINTER = "winter",
	SPRING = "spring",
	SUMMER = "summer",
	FALL = "fall",
}

export type SeasonNullable = Season | null;

export enum DaysOfWeek {
	MONDAY = "Mondays",
	TUESDAY = "Tuesdays",
	WEDNESDAY = "Wednesdays",
	THURSDAY = "Thursdays",
	FRIDAY = "Fridays",
	SATURDAY = "Saturdays",
	SUNDAY = "Sundays",
}

export type DaysOfWeekNullable = DaysOfWeek | null;

export interface AnimeTitleInfo {
	type: string;
	title: string;
}

export interface AnimeThemeInfo {
	openings: string[];
	endings: string[];
}

export interface AnimeExternalLink {
	name: string;
	url: string;
}

export interface AnimeStreamingInfo {
	name: string;
	url: string;
}

export interface ProducerTitlesInfo {
	type: string;
	title: string;
}

export type AnimeCharacterRole = "Main" | "Supporting";

export enum AnimeGenreRole {
	GENRES = "Genres",
	EXPLICIT_GENRES = "Explicit Genres",
	THEMES = "Themes",
	DEMOGRAPHICS = "Demographics",
}

export enum AnimeProducerRole {
	PRODUCER = "Producer",
	LICENSOR = "Licensor",
	STUDIO = "Studio",
}

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
