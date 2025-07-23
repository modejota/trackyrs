import type { NewCharacter } from "@trackyrs/database/schemas/myanimelist/character/character-schema";
import type { CharacterData } from "@/types";
import { ImageProcessor } from "@/utils/image-processor";

export class CharacterMapper {
	static mapCharacterData(data: CharacterData): NewCharacter {
		return {
			name: data.name,
			nameKanji: data.name_kanji,
			images: ImageProcessor.extractOptimalImageUrl(data.images),
			about: data.about,
			nicknames: data.nicknames,
		};
	}
}
