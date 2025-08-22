import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schemas from "./schemas/index";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, ".env.local"), override: true, quiet: true });

export const database = drizzle({
	connection: {
		connectionString: process.env.DATABASE_URL as string,
		ssl: false,
	},
	schema: { ...schemas },
});

export * from "./schemas/index";
