import { Command } from "commander";
import { AnimeFetcher } from "@/fetchers/anime-fetcher";

const program = new Command();

program
	.name("jikan-anime")
	.description("CLI tool for scraping anime data from the Jikan API")
	.version("1.0.0");

program
	.command("upsert-all")
	.description(
		"Upsert all anime from the Jikan API (insert new or update existing)",
	)
	.action(async () => {
		const fetcher = new AnimeFetcher();
		console.log("Upserting all anime from Jikan API...");

		const processed = await fetcher.upsertAll();
		console.log(
			`✅ Completed! Processed ${processed.inserted} inserted | ${processed.updated} updated | ${processed.skipped} skipped | ${processed.errors} errors`,
		);
	});

program
	.command("upsert-single <id>")
	.description(
		"Upsert a single anime by MAL ID (insert new or update existing)",
	)
	.action(async (id: string) => {
		const fetcher = new AnimeFetcher();
		const malId = Number.parseInt(id, 10);

		if (Number.isNaN(malId) || malId <= 0) {
			console.error("Error: ID must be a positive number");
			process.exit(1);
		}

		console.log(`Upserting anime with ID: ${malId}`);
		const processed = await fetcher.upsertSingle(malId);
		console.log(
			`✅ Completed! Processed ${processed.inserted} inserted | ${processed.updated} updated | ${processed.skipped} skipped | ${processed.errors} errors`,
		);
	});

program
	.command("upsert-range [startRowNumber]")
	.description(
		"Upsert anime starting from startRowNumber until no more entries found (insert new or update existing)",
	)
	.option("-s, --start <id>", "Starting row number", "1")
	.action(async (startId: string | undefined, options: { start?: string }) => {
		const fetcher = new AnimeFetcher();
		const start = Number.parseInt(options.start || startId || "1", 10);

		if (Number.isNaN(start) || start <= 0) {
			console.error("Error: Start row number must be a positive number");
			process.exit(1);
		}

		console.log(`Upserting anime starting from row : ${start}`);
		const processed = await fetcher.upsertRange(start);
		console.log(
			`✅ Completed! Processed ${processed.inserted} inserted | ${processed.updated} updated | ${processed.skipped} skipped | ${processed.errors} errors`,
		);
	});

program
	.command("upsert-season <year> <season>")
	.description(
		"Upsert anime by season (winter, spring, summer, fall) - insert new or update existing",
	)
	.action(async (year: string, season: string) => {
		const fetcher = new AnimeFetcher();
		const yearNum = Number.parseInt(year, 10);

		if (
			Number.isNaN(yearNum) ||
			yearNum < 1950 ||
			yearNum > new Date().getFullYear() + 5
		) {
			console.error("Error: Year must be a valid year");
			process.exit(1);
		}

		const validSeasons = ["winter", "spring", "summer", "fall"];
		if (!validSeasons.includes(season.toLowerCase())) {
			console.error(`Error: Season must be one of: ${validSeasons.join(", ")}`);
			process.exit(1);
		}

		console.log(`Upserting anime for ${season} ${yearNum}`);
		const processed = await fetcher.upsertBySeason(
			yearNum,
			season.toLowerCase(),
		);
		console.log(
			`✅ Completed! Processed ${processed.inserted} inserted | ${processed.updated} updated | ${processed.skipped} skipped | ${processed.errors} errors`,
		);
	});

program
	.command("upsert-list <ids...>")
	.description(
		"Upsert anime for a list of MAL IDs (space-separated) - insert new or update existing",
	)
	.action(async (ids: string[]) => {
		const fetcher = new AnimeFetcher();
		const malIds = ids
			.map((id) => Number.parseInt(id, 10))
			.filter((id) => !Number.isNaN(id) && id > 0);
		if (malIds.length === 0) {
			console.error(
				"Error: At least one valid positive MAL ID must be provided",
			);
			process.exit(1);
		}
		console.log(`Upserting anime for IDs: ${malIds.join(", ")}`);
		const processed = await fetcher.upsertFromList(malIds);
		console.log(
			`✅ Completed! Processed ${processed.inserted} inserted | ${processed.updated} updated | ${processed.skipped} skipped | ${processed.errors} errors`,
		);
	});

program.parse();
