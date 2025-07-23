import { characterToPeopleTable, database } from "@/index";
import type { NewCharacterToPeople } from "@/schemas/myanimelist/character/character-to-people-schema";

export default class CharacterToPeopleRepository {
	static async insertMany(relations: NewCharacterToPeople[]) {
		if (relations.length === 0) return { rowCount: 0 };

		return await database
			.insert(characterToPeopleTable)
			.values(relations)
			.onConflictDoNothing();
	}

	static async insert(relation: NewCharacterToPeople) {
		return await database
			.insert(characterToPeopleTable)
			.values(relation)
			.onConflictDoNothing();
	}
}
