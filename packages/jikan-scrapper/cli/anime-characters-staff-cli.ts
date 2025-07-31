import { Command } from "commander";
import { AnimeCharactersStaffFetcher } from "@/fetchers/anime-characters-staff-fetcher";

const program = new Command();

program
	.name("anime-characters-staff-cli")
	.description(
		"CLI for fetching anime characters and staff data (relationships)",
	)
	.version("1.0.0");

program
	.command("upsert-all")
	.description(
		"Upsert all anime characters and staff data (relationships) from the Jikan API (insert new or update existing)",
	)
	.action(async () => {
		const fetcher = new AnimeCharactersStaffFetcher();
		console.log(
			"Upserting all anime characters and staff data (relationships) from Jikan API...",
		);

		const processed = await fetcher.upsertAll();
		console.log(
			`✅ Completed! Processed ${processed.inserted} inserted | ${processed.updated} updated | ${processed.skipped} skipped | ${processed.errors} errors`,
		);
	});

program
	.command("upsert-single")
	.description(
		"Upsert characters and staff for a single anime (insert new or update existing)",
	)
	.argument("<animeId>", "Anime ID to fetch characters and staff for")
	.action(async (animeId: string) => {
		const fetcher = new AnimeCharactersStaffFetcher();
		try {
			const result = await fetcher.upsertSingle(Number.parseInt(animeId));
			console.log(
				`✅ Completed! Processed ${result.inserted} inserted | ${result.updated} updated | ${result.skipped} skipped | ${result.errors} errors`,
			);
		} catch (error) {
			console.error("Error:", error);
			process.exit(1);
		}
	});

program
	.command("upsert-range")
	.description(
		"Upsert characters and staff for anime starting from a specific ID (insert new or update existing)",
	)
	.option("-s, --start <startId>", "Starting anime ID")
	.action(async (options) => {
		const fetcher = new AnimeCharactersStaffFetcher();
		try {
			const startId = options.start
				? Number.parseInt(options.start)
				: undefined;
			const result = await fetcher.upsertRange(startId);
			console.log(
				`✅ Completed! Processed ${result.inserted} inserted | ${result.updated} updated | ${result.skipped} skipped | ${result.errors} errors`,
			);
		} catch (error) {
			console.error("Error:", error);
			process.exit(1);
		}
	});

program
	.command("upsert-list <ids...>")
	.description(
		"Upsert characters and staff for a list of anime MAL IDs (space-separated) - insert new or update existing",
	)
	.action(async (ids: string[]) => {
		const fetcher = new AnimeCharactersStaffFetcher();
		try {
			const malIds = ids
				.map((id) => Number.parseInt(id, 10))
				.filter((id) => !Number.isNaN(id) && id > 0);
			if (malIds.length === 0) {
				console.error(
					"Error: At least one valid positive MAL ID must be provided",
				);
				process.exit(1);
			}
			const result = await fetcher.upsertFromList(malIds);
			console.log(
				`✅ Completed! Processed ${result.inserted} inserted | ${result.updated} updated | ${result.skipped} skipped | ${result.errors} errors`,
			);
		} catch (error) {
			console.error("Error:", error);
			process.exit(1);
		}
	});

program.parse();
