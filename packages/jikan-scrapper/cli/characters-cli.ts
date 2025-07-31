import { Command } from "commander";
import { CharactersFetcher } from "@/fetchers/characters-fetcher";

const program = new Command();

program
	.name("jikan-characters")
	.description("CLI tool for scraping character data from the Jikan API")
	.version("1.0.0");

program
	.command("upsert-all")
	.description(
		"Upsert all characters from the Jikan API (insert new or update existing)",
	)
	.action(async () => {
		const fetcher = new CharactersFetcher();
		console.log("Upserting all characters from Jikan API...");

		const processed = await fetcher.upsertAll();
		console.log(
			`✅ Completed! Processed ${processed.inserted} inserted | ${processed.updated} updated | ${processed.skipped} skipped | ${processed.errors} errors`,
		);
	});

program
	.command("upsert-single <id>")
	.description(
		"Upsert a single character by MAL ID (insert new or update existing)",
	)
	.action(async (id: string) => {
		const fetcher = new CharactersFetcher();
		const malId = Number.parseInt(id, 10);

		if (Number.isNaN(malId) || malId <= 0) {
			console.error("Error: ID must be a positive number");
			process.exit(1);
		}

		console.log(`Upserting character with ID: ${malId}`);
		const processed = await fetcher.upsertSingle(malId);
		console.log(
			`✅ Completed! Processed ${processed.inserted} inserted | ${processed.updated} updated | ${processed.skipped} skipped | ${processed.errors} errors`,
		);
	});

program
	.command("upsert-range [startRowNumber]")
	.description(
		"Upsert characters starting from startRowNumber until no more entries found (insert new or update existing)",
	)
	.option("-s, --start <id>", "Starting row number", "1")
	.action(async (startId: string | undefined, options: { start?: string }) => {
		const fetcher = new CharactersFetcher();
		const start = Number.parseInt(options.start || startId || "1", 10);

		if (Number.isNaN(start) || start <= 0) {
			console.error("Error: Start row number must be a positive number");
			process.exit(1);
		}

		console.log(`Upserting characters starting from row: ${start}`);
		const processed = await fetcher.upsertRange(start);
		console.log(
			`✅ Completed! Processed ${processed.inserted} inserted | ${processed.updated} updated | ${processed.skipped} skipped | ${processed.errors} errors`,
		);
	});

program
	.command("upsert-list <ids...>")
	.description(
		"Upsert characters for a list of MAL IDs (space-separated) - insert new or update existing",
	)
	.action(async (ids: string[]) => {
		const fetcher = new CharactersFetcher();
		const malIds = ids
			.map((id) => Number.parseInt(id, 10))
			.filter((id) => !Number.isNaN(id) && id > 0);
		if (malIds.length === 0) {
			console.error(
				"Error: At least one valid positive MAL ID must be provided",
			);
			process.exit(1);
		}
		console.log(`Upserting characters for IDs: ${malIds.join(", ")}`);
		const processed = await fetcher.upsertFromList(malIds);
		console.log(
			`✅ Completed! Processed ${processed.inserted} inserted | ${processed.updated} updated | ${processed.skipped} skipped | ${processed.errors} errors`,
		);
	});

program.parse();
