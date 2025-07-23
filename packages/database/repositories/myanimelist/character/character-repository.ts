import { eq } from "drizzle-orm";

import { characterTable, database } from "@/index";
import type { NewCharacter } from "@/schemas/myanimelist/character/character-schema";

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
			.onConflictDoNothing();
	}

	static async update(id: number, character: NewCharacter) {
		return await database
			.update(characterTable)
			.set(character)
			.where(eq(characterTable.id, id));
	}

	static async findAllIds(): Promise<number[]> {
		const result = await database
			.select({ id: characterTable.id })
			.from(characterTable)
			.orderBy(characterTable.id);

		return result.map((row) => row.id);
	}
}
