import { eq } from "drizzle-orm";

import { database, peopleTable } from "@/index";
import type { NewPeople } from "@/schemas/myanimelist/people-schema";

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
			.onConflictDoNothing();
	}

	static async update(id: number, people: NewPeople) {
		return await database
			.update(peopleTable)
			.set(people)
			.where(eq(peopleTable.id, id));
	}

	static async findAllIds(): Promise<number[]> {
		const result = await database
			.select({ id: peopleTable.id })
			.from(peopleTable)
			.orderBy(peopleTable.id);

		return result.map((row) => row.id);
	}
}
