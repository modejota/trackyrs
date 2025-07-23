import type { NewAnimeGenre } from "@trackyrs/database/schemas/myanimelist/anime/anime-genre-schema";
import type { NewMangaGenre } from "@trackyrs/database/schemas/myanimelist/manga/manga-genre-schema";
import type { GenreData } from "@/types";

export class GenreMapper {
	static mapAnimeGenreData(data: GenreData): NewAnimeGenre {
		return {
			id: data.mal_id,
			name: data.name,
		};
	}

	static mapMangaGenreData(data: GenreData): NewMangaGenre {
		return {
			id: data.mal_id,
			name: data.name,
		};
	}
}
