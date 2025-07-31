import { Command } from "commander";
import { MangaCharactersFetcher } from "@/fetchers/manga-characters-fetcher";

const program = new Command();

program
	.name("manga-characters-cli")
	.description("CLI for fetching manga characters data (relationships)")
	.version("1.0.0");

program
	.command("upsert-all")
	.description(
		"Upsert all manga characters data (relationships) from the Jikan API (insert new or update existing)",
	)
	.action(async () => {
		const fetcher = new MangaCharactersFetcher();
		console.log(
			"Upserting all manga characters data (relationships) from Jikan API...",
		);

		const processed = await fetcher.upsertAll();
		console.log(
			`✅ Completed! Processed ${processed.inserted} inserted | ${processed.updated} updated | ${processed.skipped} skipped | ${processed.errors} errors`,
		);
	});

program
	.command("upsert-single")
	.description(
		"Upsert characters for a single manga (insert new or update existing)",
	)
	.argument("<mangaId>", "Manga ID to fetch characters for")
	.action(async (mangaId: string) => {
		const fetcher = new MangaCharactersFetcher();
		const result = await fetcher.upsertSingle(Number.parseInt(mangaId));
		console.log(
			`✅ Completed! Processed ${result.inserted} inserted | ${result.updated} updated | ${result.skipped} skipped | ${result.errors} errors`,
		);
	});

program
	.command("upsert-range")
	.description(
		"Upsert characters for manga starting from a specific ID (insert new or update existing)",
	)
	.option("-s, --start <startId>", "Starting manga ID")
	.action(async (options) => {
		const fetcher = new MangaCharactersFetcher();
		const startId = options.start ? Number.parseInt(options.start) : undefined;
		const result = await fetcher.upsertRange(startId);
		console.log(
			`✅ Completed! Processed ${result.inserted} inserted | ${result.updated} updated | ${result.skipped} skipped | ${result.errors} errors`,
		);
	});

program
	.command("upsert-list <ids...>")
	.description(
		"Upsert characters for a list of manga MAL IDs (space-separated) - insert new or update existing",
	)
	.action(async (ids: string[]) => {
		const fetcher = new MangaCharactersFetcher();
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
	});

program.parse();
