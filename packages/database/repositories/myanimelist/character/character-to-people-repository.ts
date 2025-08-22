import { sql } from "drizzle-orm";
import { characterToPeopleTable, database } from "../../../index";
import type {
	CharacterToPeople,
	NewCharacterToPeople,
} from "../../../schemas/myanimelist/character/character-to-people-schema";

export default class CharacterToPeopleRepository {
	static async insert(relation: NewCharacterToPeople) {
		return await database
			.insert(characterToPeopleTable)
			.values(relation)
			.onConflictDoNothing();
	}

	static async insertMany(relations: NewCharacterToPeople[]) {
		if (relations.length === 0) return { rowCount: 0 };

		return await database
			.insert(characterToPeopleTable)
			.values(relations)
			.onConflictDoNothing();
	}

	static async upsert(
		relation: NewCharacterToPeople,
	): Promise<CharacterToPeople> {
		const result = await database
			.insert(characterToPeopleTable)
			.values(relation)
			.onConflictDoUpdate({
				target: [
					characterToPeopleTable.characterId,
					characterToPeopleTable.peopleId,
					characterToPeopleTable.language,
				],
				set: relation,
			})
			.returning();
		return result[0] as CharacterToPeople;
	}

	static async upsertMany(
		relations: NewCharacterToPeople[],
	): Promise<CharacterToPeople[]> {
		if (relations.length === 0) return [];

		const result = await database
			.insert(characterToPeopleTable)
			.values(relations)
			.onConflictDoUpdate({
				target: [
					characterToPeopleTable.characterId,
					characterToPeopleTable.peopleId,
					characterToPeopleTable.language,
				],
				set: {
					characterId: sql`excluded.character_id`,
					peopleId: sql`excluded.people_id`,
					language: sql`excluded.language`,
				},
			})
			.returning();
		return result as CharacterToPeople[];
	}
}
