import { Command } from "commander";
import { AnimeEpisodesFetcher } from "@/fetchers/anime-episodes-fetcher";

const program = new Command();

program
	.name("jikan-anime-episodes")
	.description("CLI tool for scraping anime episode data from the Jikan API")
	.version("1.0.0");

program
	.command("upsert-all")
	.description(
		"Upsert all anime episodes from the Jikan API (insert new or update existing)",
	)
	.action(async () => {
		const fetcher = new AnimeEpisodesFetcher();
		console.log("Upserting all anime episodes from Jikan API...");

		const processed = await fetcher.upsertAll();
		console.log(
			`✅ Completed! Processed ${processed.inserted} inserted | ${processed.updated} updated | ${processed.skipped} skipped | ${processed.errors} errors`,
		);
	});

program
	.command("upsert-single <animeId>")
	.description(
		"Upsert episodes for a specific anime by MAL ID (insert new or update existing)",
	)
	.action(async (animeId: string) => {
		const fetcher = new AnimeEpisodesFetcher();
		const id = Number.parseInt(animeId, 10);
		if (Number.isNaN(id) || id <= 0) {
			console.error("Error: Anime ID must be a positive number");
			process.exit(1);
		}
		console.log(`Upserting episodes for anime ${id}...`);
		const processed = await fetcher.upsertSingle(id);
		console.log(
			`✅ Completed! Processed ${processed.inserted} inserted | ${processed.updated} updated episodes for anime ${id} | ${processed.skipped} skipped | ${processed.errors} errors`,
		);
	});

program
	.command("upsert-range [startId]")
	.description(
		"Upsert episodes for anime starting from a specific MAL ID (insert new or update existing)",
	)
	.option("-s, --start <startId>", "Starting anime ID", "1")
	.action(async (startId: string | undefined, options: { start?: string }) => {
		const fetcher = new AnimeEpisodesFetcher();
		const start = Number.parseInt(options.start || startId || "1", 10);
		if (Number.isNaN(start) || start <= 0) {
			console.error("Error: Start ID must be a positive number");
			process.exit(1);
		}
		console.log(`Upserting episodes for anime starting from ID: ${start}`);
		const processed = await fetcher.upsertRange(start);
		console.log(
			`✅ Completed! Processed ${processed.inserted} inserted | ${processed.updated} updated episodes | ${processed.skipped} skipped | ${processed.errors} errors`,
		);
	});

program
	.command("upsert-list <ids...>")
	.description(
		"Upsert episodes for a list of anime MAL IDs (space-separated) - insert new or update existing",
	)
	.action(async (ids: string[]) => {
		const fetcher = new AnimeEpisodesFetcher();
		const malIds = ids
			.map((id) => Number.parseInt(id, 10))
			.filter((id) => !Number.isNaN(id) && id > 0);
		if (malIds.length === 0) {
			console.error(
				"Error: At least one valid positive MAL ID must be provided",
			);
			process.exit(1);
		}
		console.log(`Upserting episodes for anime IDs: ${malIds.join(", ")}`);
		const processed = await fetcher.upsertFromList(malIds);
		console.log(
			`✅ Completed! Processed ${processed.inserted} inserted | ${processed.updated} updated episodes | ${processed.skipped} skipped | ${processed.errors} errors`,
		);
	});

program.parse();
