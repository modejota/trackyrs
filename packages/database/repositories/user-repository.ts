import { eq } from "drizzle-orm";
import { database } from "../index";
import { user as userTable } from "../schemas/auth-schema";

export default class UserRepository {
	static async findByUsername(username: string) {
		const result = await database
			.select()
			.from(userTable)
			.where(eq(userTable.username, username))
			.limit(1);
		return result[0] ?? null;
	}
}
