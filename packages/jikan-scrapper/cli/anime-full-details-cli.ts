import { Command } from "commander";
import { AnimeFullDetailsFetcher } from "@/fetchers/anime-full-details-fetcher";

const program = new Command();

program
	.name("anime-full-details-cli")
	.description(
		"CLI for fetching and inserting anime relationships (anime-to-anime, anime-to-manga, anime-to-genre, anime-to-producers)",
	)
	.version("1.0.0");

program
	.command("upsert-all")
	.description(
		"Upsert all anime relationships from the Jikan API (insert new or update existing)",
	)
	.action(async () => {
		const fetcher = new AnimeFullDetailsFetcher();
		console.log("Upserting relationships for all anime from Jikan API...");

		const processed = await fetcher.upsertAll();
		console.log(
			`✅ Completed! Processed ${processed.inserted} inserted | ${processed.updated} updated | ${processed.skipped} skipped | ${processed.errors} errors`,
		);
	});

program
	.command("upsert-single")
	.description(
		"Upsert relationships for a single anime by ID (insert new or update existing)",
	)
	.argument("<id>", "Anime ID to upsert relationships for")
	.action(async (id: string) => {
		const animeId = Number.parseInt(id, 10);
		if (Number.isNaN(animeId)) {
			console.error("Error: Anime ID must be a valid number");
			process.exit(1);
		}

		console.log(`Upserting relationships for anime ID: ${animeId}`);
		const fetcher = new AnimeFullDetailsFetcher();
		const count = await fetcher.upsertSingle(animeId);
		console.log(
			`✅ Completed! Processed ${count.inserted} inserted | ${count.updated} updated | ${count.skipped} skipped | ${count.errors} errors`,
		);
	});

program
	.command("upsert-range")
	.description(
		"Upsert relationships for anime starting from a specific ID until no more entries (insert new or update existing)",
	)
	.argument("[startId]", "Starting anime ID (default: 1)", "1")
	.action(async (startId: string) => {
		const start = Number.parseInt(startId, 10);
		if (Number.isNaN(start)) {
			console.error("Error: Start ID must be a valid number");
			process.exit(1);
		}

		console.log(`Upserting relationships for anime starting from ID: ${start}`);
		const fetcher = new AnimeFullDetailsFetcher();
		const count = await fetcher.upsertRange(start);
		console.log(
			`✅ Completed! Processed ${count.inserted} inserted | ${count.updated} updated | ${count.skipped} skipped | ${count.errors} errors`,
		);
	});

program
	.command("upsert-list <ids...>")
	.description(
		"Upsert relationships for a list of anime MAL IDs (space-separated) - insert new or update existing",
	)
	.action(async (ids: string[]) => {
		const fetcher = new AnimeFullDetailsFetcher();
		const malIds = ids
			.map((id) => Number.parseInt(id, 10))
			.filter((id) => !Number.isNaN(id) && id > 0);
		if (malIds.length === 0) {
			console.error(
				"Error: At least one valid positive MAL ID must be provided",
			);
			process.exit(1);
		}
		console.log(`Upserting relationships for anime IDs: ${malIds.join(", ")}`);
		const processed = await fetcher.upsertFromList(malIds);
		console.log(
			`✅ Completed! Processed ${processed.inserted} inserted | ${processed.updated} updated | ${processed.skipped} skipped | ${processed.errors} errors`,
		);
	});

program.parse();
