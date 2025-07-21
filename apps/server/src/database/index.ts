import { drizzle } from "drizzle-orm/node-postgres";
import * as schemas from "./schemas";

export const database = drizzle({
	connection: {
		connectionString: process.env.DATABASE_URL,
		ssl: false,
	},
	schema: { ...schemas },
});
