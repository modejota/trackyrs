import { join } from "node:path";
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: join(__dirname, ".env.local"), override: true, quiet: true });

export default defineConfig({
	dialect: "postgresql",
	schema: "./schemas/**/*.ts",
	out: "./migrations",
	dbCredentials: {
		url: process.env.DATABASE_URL as string,
	},
});
