import { asc, eq, ilike } from "drizzle-orm";

import { database } from "../../../index";
import { animeTable } from "../../../schemas/myanimelist/anime/anime-schema";
import { animeToCharacterTable } from "../../../schemas/myanimelist/anime/anime-to-character-schema";
import {
	type Character,
	characterTable,
	type NewCharacter,
} from "../../../schemas/myanimelist/character/character-schema";
import { characterToPeopleTable } from "../../../schemas/myanimelist/character/character-to-people-schema";
import { mangaTable } from "../../../schemas/myanimelist/manga/manga-schema";
import { mangaToCharacterTable } from "../../../schemas/myanimelist/manga/manga-to-character-schema";
import { peopleTable } from "../../../schemas/myanimelist/people-schema";

export default class CharacterRepository {
	static async findById(id: number) {
		const result = await database
			.select()
			.from(characterTable)
			.where(eq(characterTable.id, id))
			.limit(1);
		return result[0];
	}

	static async insert(character: NewCharacter) {
		return await database
			.insert(characterTable)
			.values(character)
			.onConflictDoNothing({ target: characterTable.id });
	}

	static async update(id: number, character: NewCharacter) {
		return await database
			.update(characterTable)
			.set(character)
			.where(eq(characterTable.id, id));
	}

	static async upsert(character: NewCharacter): Promise<Character> {
		const result = await database
			.insert(characterTable)
			.values(character)
			.onConflictDoUpdate({
				target: characterTable.id,
				set: character,
			})
			.returning();
		return result[0] as Character;
	}

	static async findByIdWithRelations(id: number) {
		const character = await CharacterRepository.findById(id);
		if (!character) return null;

		const voiceActors = await database
			.select({
				people: {
					id: peopleTable.id,
					name: peopleTable.name,
					givenName: peopleTable.givenName,
					familyName: peopleTable.familyName,
					alternateNames: peopleTable.alternateNames,
					birthday: peopleTable.birthday,
					about: peopleTable.about,
					images: peopleTable.images,
				},
				language: characterToPeopleTable.language,
			})
			.from(characterToPeopleTable)
			.innerJoin(
				peopleTable,
				eq(characterToPeopleTable.peopleId, peopleTable.id),
			)
			.where(eq(characterToPeopleTable.characterId, id));

		const animeAppearances = await database
			.select({
				anime: {
					id: animeTable.id,
					title: animeTable.title,
					titleEnglish: animeTable.titleEnglish,
					titleJapanese: animeTable.titleJapanese,
					images: animeTable.images,
					type: animeTable.type,
					status: animeTable.status,
				},
				role: animeToCharacterTable.role,
			})
			.from(animeToCharacterTable)
			.innerJoin(animeTable, eq(animeToCharacterTable.animeId, animeTable.id))
			.where(eq(animeToCharacterTable.characterId, id));

		const mangaAppearances = await database
			.select({
				manga: {
					id: mangaTable.id,
					title: mangaTable.title,
					titleEnglish: mangaTable.titleEnglish,
					titleJapanese: mangaTable.titleJapanese,
					images: mangaTable.images,
					type: mangaTable.type,
					status: mangaTable.status,
				},
				role: mangaToCharacterTable.role,
			})
			.from(mangaToCharacterTable)
			.innerJoin(mangaTable, eq(mangaToCharacterTable.mangaId, mangaTable.id))
			.where(eq(mangaToCharacterTable.characterId, id));

		return {
			character,
			voiceActors,
			animeAppearances,
			mangaAppearances,
		};
	}

	static async search(name: string, limit = 24, offset = 0) {
		const trimmed = name.trim();
		if (!trimmed) return [];
		const pattern = `%${trimmed}%`;

		return await database
			.select()
			.from(characterTable)
			.where(ilike(characterTable.name, pattern))
			.orderBy(asc(characterTable.name))
			.limit(limit)
			.offset(offset);
	}
}
