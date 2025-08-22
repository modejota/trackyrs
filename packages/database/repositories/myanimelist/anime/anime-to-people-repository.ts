import { sql } from "drizzle-orm";
import { animeToPeopleTable, database } from "../../../index";
import type {
	AnimeToPeople,
	NewAnimeToPeople,
} from "../../../schemas/myanimelist/anime/anime-to-people-schema";

export default class AnimeToPeopleRepository {
	static async insert(relation: NewAnimeToPeople) {
		return await database
			.insert(animeToPeopleTable)
			.values(relation)
			.onConflictDoNothing();
	}

	static async insertMany(relations: NewAnimeToPeople[]) {
		if (relations.length === 0) return { rowCount: 0 };

		return await database
			.insert(animeToPeopleTable)
			.values(relations)
			.onConflictDoNothing();
	}

	static async upsert(relation: NewAnimeToPeople): Promise<AnimeToPeople> {
		const result = await database
			.insert(animeToPeopleTable)
			.values(relation)
			.onConflictDoUpdate({
				target: [
					animeToPeopleTable.animeId,
					animeToPeopleTable.peopleId,
					animeToPeopleTable.positions,
				],
				set: relation,
			})
			.returning();
		return result[0] as AnimeToPeople;
	}

	static async upsertMany(
		relations: NewAnimeToPeople[],
	): Promise<AnimeToPeople[]> {
		if (relations.length === 0) return [];

		const result = await database
			.insert(animeToPeopleTable)
			.values(relations)
			.onConflictDoUpdate({
				target: [
					animeToPeopleTable.animeId,
					animeToPeopleTable.peopleId,
					animeToPeopleTable.positions,
				],
				set: {
					animeId: sql`excluded.anime_id`,
					peopleId: sql`excluded.people_id`,
					positions: sql`excluded.positions`,
				},
			})
			.returning();
		return result as AnimeToPeople[];
	}
}
