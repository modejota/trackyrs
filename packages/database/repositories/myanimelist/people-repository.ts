import { asc, desc, eq, ilike } from "drizzle-orm";

import { database } from "../../index";
import { animeTable } from "../../schemas/myanimelist/anime/anime-schema";
import { animeToPeopleTable } from "../../schemas/myanimelist/anime/anime-to-people-schema";
import { characterTable } from "../../schemas/myanimelist/character/character-schema";
import { characterToPeopleTable } from "../../schemas/myanimelist/character/character-to-people-schema";
import { mangaTable } from "../../schemas/myanimelist/manga/manga-schema";
import { mangaToPeopleTable } from "../../schemas/myanimelist/manga/manga-to-people-schema";
import {
	type NewPeople,
	type People,
	peopleTable,
} from "../../schemas/myanimelist/people-schema";

export default class PeopleRepository {
	static async findById(id: number) {
		const result = await database
			.select()
			.from(peopleTable)
			.where(eq(peopleTable.id, id))
			.limit(1);
		return result[0];
	}

	static async insert(people: NewPeople) {
		return await database
			.insert(peopleTable)
			.values(people)
			.onConflictDoNothing({ target: peopleTable.id });
	}

	static async update(id: number, people: NewPeople) {
		return await database
			.update(peopleTable)
			.set(people)
			.where(eq(peopleTable.id, id));
	}

	static async upsert(people: NewPeople): Promise<People> {
		const result = await database
			.insert(peopleTable)
			.values(people)
			.onConflictDoUpdate({
				target: peopleTable.id,
				set: people,
			})
			.returning();
		return result[0] as People;
	}

	static async findByIdWithRelations(id: number) {
		const person = await PeopleRepository.findById(id);
		if (!person) return null;

		const animeStaff = await database
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
				positions: animeToPeopleTable.positions,
			})
			.from(animeToPeopleTable)
			.innerJoin(animeTable, eq(animeToPeopleTable.animeId, animeTable.id))
			.where(eq(animeToPeopleTable.peopleId, id));

		const mangaStaff = await database
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
			})
			.from(mangaToPeopleTable)
			.innerJoin(mangaTable, eq(mangaToPeopleTable.mangaId, mangaTable.id))
			.where(eq(mangaToPeopleTable.peopleId, id));

		const voiceActing = await database
			.select({
				character: {
					id: characterTable.id,
					name: characterTable.name,
					nameKanji: characterTable.nameKanji,
					images: characterTable.images,
				},
				language: characterToPeopleTable.language,
			})
			.from(characterToPeopleTable)
			.innerJoin(
				characterTable,
				eq(characterToPeopleTable.characterId, characterTable.id),
			)
			.where(eq(characterToPeopleTable.peopleId, id));

		return {
			people: person,
			animeStaff,
			mangaStaff,
			voiceActing,
		};
	}

	static async search(name: string, limit = 24, offset = 0) {
		const trimmed = name.trim();
		if (!trimmed) return [];
		const pattern = `%${trimmed}%`;

		return await database
			.select()
			.from(peopleTable)
			.where(ilike(peopleTable.name, pattern))
			.orderBy(desc(peopleTable.referenceFavorites), asc(peopleTable.name))
			.limit(limit)
			.offset(offset);
	}

	static async quickSearch(name: string, limit = 6, offset = 0) {
		const trimmed = name.trim();
		if (!trimmed)
			return [] as Array<{
				id: number;
				name: string;
				givenName: string | null;
				familyName: string | null;
				images: string;
			}>;
		const pattern = `%${trimmed}%`;

		return await database
			.select({
				id: peopleTable.id,
				name: peopleTable.name,
				givenName: peopleTable.givenName,
				familyName: peopleTable.familyName,
				images: peopleTable.images,
			})
			.from(peopleTable)
			.where(ilike(peopleTable.name, pattern))
			.orderBy(desc(peopleTable.referenceFavorites), asc(peopleTable.name))
			.limit(limit)
			.offset(offset);
	}
}
