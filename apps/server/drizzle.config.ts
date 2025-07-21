import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: [".env.local"], override: true });

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/database/schemas/**/*.ts",
	out: "./migrations",
	dbCredentials: {
		url: process.env.DATABASE_URL as string,
	},
});
