/**
 * TypeScript interfaces based on Jikan API OpenAPI specification
 * These types represent data received from the Jikan API
 */

import type { ProducerTitlesInfo } from "@trackyrs/database/schemas/myanimelist/anime/anime-producer-schema";
import type {
	AnimeExternalLink,
	AnimeStatus,
	AnimeThemeInfo,
	AnimeTitleInfo,
	AnimeType,
	DaysOfWeekNullable,
	Rating,
	SeasonNullable,
} from "@trackyrs/database/schemas/myanimelist/anime/anime-schema";
import type {
	MangaStatus,
	MangaType,
} from "@trackyrs/database/schemas/myanimelist/manga/manga-schema";

export interface AnimeData {
	mal_id: number;
	url: string;
	images: ImageCollection;
	trailer: TrailerInfo;
	approved: boolean;
	titles: AnimeTitleInfo[];
	title: string;
	title_english: string | null;
	title_japanese: string | null;
	title_synonyms: string[];
	type: AnimeType | null;
	source: string | null;
	episodes: number | null;
	status: AnimeStatus;
	airing: boolean;
	aired: DateRange;
	duration: string | null;
	rating: Rating | null;
	score: number | null;
	scored_by: number | null;
	rank: number | null;
	popularity: number | null;
	members: number | null;
	favorites: number | null;
	synopsis: string | null;
	background: string | null;
	season: SeasonNullable;
	year: number | null;
	broadcast: BroadcastInfo;
	producers: ProducerInfo[];
	licensors: ProducerInfo[];
	studios: ProducerInfo[];
	genres: GenreInfo[];
	explicit_genres: GenreInfo[];
	themes: GenreInfo[];
	demographics: GenreInfo[];
	relations?: RelationInfo[];
	theme?: AnimeThemeInfo;
	external?: AnimeExternalLink[];
	streaming?: StreamingLink[];
}

export interface MangaData {
	mal_id: number;
	url: string;
	images: ImageCollection;
	approved: boolean;
	titles: AnimeTitleInfo[];
	title: string;
	title_english: string | null;
	title_japanese: string | null;
	title_synonyms: string[];
	type: MangaType | null;
	chapters: number | null;
	volumes: number | null;
	status: MangaStatus;
	publishing: boolean;
	published: DateRange;
	score: number | null;
	scored_by: number | null;
	rank: number | null;
	popularity: number | null;
	members: number | null;
	favorites: number | null;
	synopsis: string | null;
	background: string | null;
	authors: Array<{
		mal_id: number;
		type: string;
		name: string;
		url: string;
	}>;
	serializations: Array<{
		mal_id: number;
		type: string;
		name: string;
		url: string;
	}>;
	genres: GenreInfo[];
	explicit_genres: GenreInfo[];
	themes: GenreInfo[];
	demographics: GenreInfo[];
	relations?: RelationInfo[];
	external?: AnimeExternalLink[];
}

export interface CharacterData {
	mal_id: number;
	url: string;
	images: ImageCollection;
	name: string;
	name_kanji: string | null;
	nicknames: string[];
	favorites: number;
	about: string | null;
}

export interface PersonData {
	mal_id: number;
	url: string;
	website_url: string | null;
	images: ImageCollection;
	name: string;
	given_name: string | null;
	family_name: string | null;
	alternate_names: string[];
	birthday: string | null;
	favorites: number;
	about: string | null;
}

export interface EpisodeData {
	mal_id: number;
	url: string;
	title: string;
	title_japanese: string | null;
	title_romanji: string | null;
	aired: string | null;
	score: number | null;
	filler: boolean;
	recap: boolean;
	forum_url: string | null;
}

export interface AnimeCharacterData {
	character: {
		mal_id: number;
		url: string;
		images: ImageCollection;
		name: string;
	};
	role: string;
	favorites: number;
	voice_actors: Array<{
		person: {
			mal_id: number;
			url: string;
			images: ImageCollection;
			name: string;
		};
		language: string;
	}>;
}

export interface AnimeStaffData {
	person: {
		mal_id: number;
		url: string;
		images: ImageCollection;
		name: string;
	};
	positions: string[];
}

export interface MangaCharacterData {
	character: {
		mal_id: number;
		url: string;
		images: ImageCollection;
		name: string;
	};
	role: string;
}

export interface GenreData {
	mal_id: number;
	name: string;
	url: string;
	count: number;
}

export interface ProducerData {
	mal_id: number;
	url: string;
	titles: ProducerTitlesInfo[];
	images: ImageCollection;
	favorites: number;
	about: string | null;
	established: string | null;
	count: number;
}

export interface MagazineData {
	mal_id: number;
	name: string;
	url: string;
	count: number;
}

export interface SeasonAnimeData {
	year: number;
	seasons: string[];
}

export interface AnimeFullData extends AnimeData {
	relations: RelationInfo[];
	theme: AnimeThemeInfo;
	external: AnimeExternalLink[];
	streaming: StreamingLink[];
}

export interface JikanResponse<T> {
	data: T;
	pagination?: PaginationInfo;
}

export interface PaginationInfo {
	items: {
		total: number;
		count: number;
		per_page: number;
	};
	has_next_page: boolean;
	current_page: number;
	last_visible_page: number;
}

export interface PaginatedResponse<T> {
	data: T[];
	pagination: PaginationInfo;
}

export interface SeasonAnimeResponse {
	data: AnimeData[];
	pagination: PaginationInfo;
}

export interface AnimeEpisodesResponse {
	data: EpisodeData[];
	pagination: PaginationInfo;
}

export interface AnimeCharactersStaffResponse {
	data: {
		characters: AnimeCharacterData[];
		staff: AnimeStaffData[];
	};
}

export interface MangaCharactersResponse {
	data: MangaCharacterData[];
}

export interface PicturesResponse {
	data: Array<{
		jpg: {
			image_url: string;
			small_image_url: string;
			large_image_url: string;
		};
		webp: {
			image_url: string;
			small_image_url: string;
			large_image_url: string;
		};
	}>;
}

export interface VoiceActorData {
	person: PersonData;
	language: string;
}

export interface CharacterFullData extends CharacterData {
	anime: Array<{
		role: string;
		anime: AnimeData;
	}>;
	manga: Array<{
		role: string;
		manga: MangaData;
	}>;
	voices: VoiceActorData[];
}

export interface PersonFullData extends PersonData {
	anime: Array<{
		position: string;
		anime: AnimeData;
	}>;
	manga: Array<{
		position: string;
		manga: MangaData;
	}>;
	voices: Array<{
		role: string;
		anime: AnimeData;
		character: CharacterData;
	}>;
}

export interface ImageCollection {
	jpg: ImageVariants;
	webp: ImageVariants;
}

export interface ImageVariants {
	image_url: string;
	small_image_url: string;
	large_image_url: string;
}

export interface DateRange {
	from: string | null;
	to: string | null;
	prop: {
		from: {
			day: number | null;
			month: number | null;
			year: number | null;
		};
		to: {
			day: number | null;
			month: number | null;
			year: number | null;
		};
	};
	string: string;
}

export interface TrailerInfo {
	youtube_id: string | null;
	url: string | null;
	embed_url: string | null;
	images: {
		image_url: string | null;
		small_image_url: string | null;
		medium_image_url: string | null;
		large_image_url: string | null;
		maximum_image_url: string | null;
	};
}

export interface BroadcastInfo {
	day: DaysOfWeekNullable;
	time: string | null;
	timezone: string | null;
	string: string | null;
}

export interface GenreInfo {
	mal_id: number;
	type: string;
	name: string;
	url: string;
}

export interface ProducerInfo {
	mal_id: number;
	type: string;
	name: string;
	url: string;
}

export interface RelationInfo {
	relation: string;
	entry: Array<{
		mal_id: number;
		type: string;
		name: string;
		url: string;
	}>;
}

export interface StreamingLink {
	name: string;
	url: string;
}
