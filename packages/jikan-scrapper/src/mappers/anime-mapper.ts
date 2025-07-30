import type { NewAnime } from "@trackyrs/database/schemas/myanimelist/anime/anime-schema";
import type { AnimeGenreRole } from "@trackyrs/database/schemas/myanimelist/anime/anime-to-genre-schema";
import type { AnimeProducerRole } from "@trackyrs/database/schemas/myanimelist/anime/anime-to-producers-schema";
import type { NewCharacterToPeople } from "@trackyrs/database/schemas/myanimelist/character/character-to-people-schema";
import type {
	AnimeCharacterData,
	AnimeData,
	AnimeStaffData,
	EpisodeData,
} from "@/types";
import { ImageProcessor } from "@/utils/image-processor";

export class AnimeMapper {
	static mapAnimeData(data: AnimeData): NewAnime {
		return {
			id: data.mal_id,
			approved: data.approved,
			images: ImageProcessor.extractOptimalImageUrl(data.images),
			trailer: data.trailer?.url || null,
			title: data.title,
			titles: data.titles,
			titleEnglish: data.title_english,
			titleJapanese: data.title_japanese,
			titleSynonyms: data.title_synonyms,
			type: data.type,
			source: data.source,
			numberEpisodes: data.episodes,
			status: data.status,
			airing: data.airing,
			airedFrom: data.aired.from,
			airedTo: data.aired.to,
			duration: AnimeMapper.convertDurationToSeconds(data.duration),
			rating: data.rating,
			synopsis: data.synopsis,
			background: data.background,
			season: data.season,
			year: data.year,
			broadcastDay: data.broadcast.day,
			broadcastTime: data.broadcast.time,
			broadcastTimezone: data.broadcast.timezone,
			theme: data.theme ? [data.theme] : [],
			external: data.external || [],
			streaming: data.streaming || [],
		};
	}

	static mapAnimeThemeExternalStreamingDetails(data: AnimeData) {
		return {
			theme: data.theme ? [data.theme] : [],
			external: data.external || [],
			streaming: data.streaming || [],
		};
	}

	static mapProducerRelation(
		animeId: number,
		producerId: number,
		role: AnimeProducerRole,
	) {
		return {
			animeId: animeId,
			producerId: producerId,
			role: role,
		};
	}

	static mapGenreRelation(
		animeId: number,
		genreId: number,
		role: AnimeGenreRole,
	) {
		return {
			animeId: animeId,
			genreId: genreId,
			role: role,
		};
	}

	static mapEpisodeData(animeId: number, data: EpisodeData) {
		return {
			animeId,
			episodeNumber: data.mal_id,
			title: data.title,
			titleJapanese: data.title_japanese,
			titleRomaji: data.title_romanji ? data.title_romanji.trim() : null,
			aired: data.aired,
			filler: data.filler ?? false,
			recap: data.recap ?? false,
		};
	}

	static mapCharacterRelation(animeId: number, data: AnimeCharacterData) {
		return {
			animeId,
			characterId: data.character.mal_id,
			role: data.role,
		};
	}

	static mapCharacterToPeopleRelation(
		characterId: number,
		data: AnimeCharacterData,
	) {
		const relations: NewCharacterToPeople[] = [];

		if (data.voice_actors?.length) {
			for (const voiceActor of data.voice_actors) {
				relations.push({
					characterId,
					peopleId: voiceActor.person.mal_id,
					language: voiceActor.language,
				});
			}
		}

		return relations;
	}

	static mapStaffRelation(animeId: number, data: AnimeStaffData) {
		return {
			animeId,
			peopleId: data.person.mal_id,
			positions: data.positions,
		};
	}

	private static convertDurationToSeconds(
		duration: string | null,
	): number | null {
		if (!duration) return null;

		const match = duration.match(/(\d+)\s*min/);
		if (match) {
			return 60 * Number.parseInt(match[1] as string);
		}

		return null;
	}
}
