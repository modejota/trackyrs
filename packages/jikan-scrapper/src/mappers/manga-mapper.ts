import type { NewManga } from "@trackyrs/database/schemas/myanimelist/manga/manga-schema";
import {
	MangaGenreRole,
	type NewMangaToGenre,
} from "@trackyrs/database/schemas/myanimelist/manga/manga-to-genre-schema";
import type { NewMangaToMagazine } from "@trackyrs/database/schemas/myanimelist/manga/manga-to-magazine-schema";
import type { NewMangaToPeople } from "@trackyrs/database/schemas/myanimelist/manga/manga-to-people-schema";
import type { MangaCharacterData, MangaData } from "@/types";
import { ImageProcessor } from "@/utils/image-processor";

export class MangaMapper {
	static mapMangaData(data: MangaData): NewManga {
		return {
			id: data.mal_id,
			approved: data.approved,
			images: ImageProcessor.extractOptimalImageUrl(data.images),
			title: data.title,
			titles: data.titles,
			titleEnglish: data.title_english,
			titleJapanese: data.title_japanese,
			titleSynonyms: data.title_synonyms,
			type: data.type,
			numberChapters: data.chapters,
			numberVolumes: data.volumes,
			status: data.status,
			publishing: data.publishing,
			publishingFrom: data.published.from,
			publishingTo: data.published.to,
			synopsis: data.synopsis,
			background: data.background,
		};
	}

	static mapGenreRelations(
		mangaId: number,
		data: MangaData,
		genreMap: Map<number, number>,
	): NewMangaToGenre[] {
		const relations: NewMangaToGenre[] = [];

		const genreTypes = [
			{ list: data.genres, role: MangaGenreRole.GENRES },
			{ list: data.explicit_genres, role: MangaGenreRole.EXPLICIT_GENRES },
			{ list: data.themes, role: MangaGenreRole.THEMES },
			{ list: data.demographics, role: MangaGenreRole.DEMOGRAPHICS },
		];

		for (const { list, role } of genreTypes) {
			if (!list?.length) continue;
			for (const genre of list) {
				const genreId = genreMap.get(genre.mal_id);
				if (genreId) {
					relations.push({ mangaId, genreId, role });
				}
			}
		}

		return relations;
	}

	static mapMagazineRelations(
		mangaId: number,
		data: MangaData,
	): NewMangaToMagazine[] {
		const relations: NewMangaToMagazine[] = [];

		if (data.serializations?.length) {
			for (const magazine of data.serializations) {
				relations.push({ mangaId, magazineId: magazine.mal_id });
			}
		}

		return relations;
	}

	static mapPeopleRelations(
		mangaId: number,
		data: MangaData,
	): NewMangaToPeople[] {
		const relations: NewMangaToPeople[] = [];

		if (data.authors?.length) {
			for (const person of data.authors) {
				relations.push({ mangaId, peopleId: person.mal_id });
			}
		}

		return relations;
	}

	static mapCharacterRelation(mangaId: number, data: MangaCharacterData) {
		return {
			mangaId,
			characterId: data.character.mal_id,
			role: data.role,
		};
	}
}
