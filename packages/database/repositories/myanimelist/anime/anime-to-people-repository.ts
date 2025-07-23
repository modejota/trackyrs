import { animeToPeopleTable, database } from "@/index";
import type { NewAnimeToPeople } from "@/schemas/myanimelist/anime/anime-to-people-schema";

export default class AnimeToPeopleRepository {
	static async insertMany(relations: NewAnimeToPeople[]) {
		if (relations.length === 0) return { rowCount: 0 };

		return await database
			.insert(animeToPeopleTable)
			.values(relations)
			.onConflictDoNothing();
	}

	static async insert(relation: NewAnimeToPeople) {
		return await database
			.insert(animeToPeopleTable)
			.values(relation)
			.onConflictDoNothing();
	}
}
