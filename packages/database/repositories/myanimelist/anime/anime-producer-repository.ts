import { eq } from "drizzle-orm";
import { animeProducersTable, database } from "../../../index";
import type {
	NewProducer,
	Producer,
} from "../../../schemas/myanimelist/anime/anime-producer-schema";

export default class AnimeProducerRepository {
	static async findById(id: number) {
		const result = await database
			.select()
			.from(animeProducersTable)
			.where(eq(animeProducersTable.id, id))
			.limit(1);
		return result[0];
	}

	static async insert(producer: NewProducer) {
		return await database
			.insert(animeProducersTable)
			.values(producer)
			.onConflictDoNothing({ target: animeProducersTable.id });
	}

	static async update(id: number, producer: NewProducer) {
		return await database
			.update(animeProducersTable)
			.set(producer)
			.where(eq(animeProducersTable.id, id));
	}

	static async upsert(producer: NewProducer): Promise<Producer> {
		const result = await database
			.insert(animeProducersTable)
			.values(producer)
			.onConflictDoUpdate({
				target: animeProducersTable.id,
				set: producer,
			})
			.returning();
		return result[0] as Producer;
	}
}
