import { Command } from "commander";
import { handleError } from "@/fetcher-error";
import { MangaCharactersFetcher } from "@/fetchers/manga-characters-fetcher";

const program = new Command();

program
	.name("manga-characters-cli")
	.description("CLI for fetching manga characters data (relationships)")
	.version("1.0.0");

program
	.command("insert-all")
	.description(
		"Insert all manga characters data (relationships) from the Jikan API",
	)
	.action(async () => {
		try {
			const fetcher = new MangaCharactersFetcher();
			console.log(
				"Inserting all manga characters data (relationships) from Jikan API...",
			);
			console.log("This may take a while as it processes all paginated data.");

			const processed = await fetcher.insertAll();
			console.log(
				`✅ Completed! Processed ${processed.inserted} entities | ${processed.skipped} skipped | ${processed.errors} errors`,
			);
		} catch (error) {
			handleError(error);
		}
	});

program
	.command("insert-single")
	.description("Insert characters for a single manga")
	.argument("<mangaId>", "Manga ID to fetch characters for")
	.action(async (mangaId: string) => {
		const fetcher = new MangaCharactersFetcher();
		try {
			const result = await fetcher.insertSingle(Number.parseInt(mangaId));
			console.log(
				`✅ Completed! Processed ${result.inserted} entities | ${result.skipped} skipped | ${result.errors} errors`,
			);
		} catch (error) {
			console.error("Error:", error);
			process.exit(1);
		}
	});

program
	.command("insert-range")
	.description("Insert characters for manga starting from a specific ID")
	.option("-s, --start <startId>", "Starting manga ID")
	.action(async (options) => {
		const fetcher = new MangaCharactersFetcher();
		try {
			const startId = options.start
				? Number.parseInt(options.start)
				: undefined;
			const result = await fetcher.insertRange(startId);
			console.log(
				`✅ Completed! Processed ${result.inserted} entities | ${result.skipped} skipped | ${result.errors} errors`,
			);
		} catch (error) {
			console.error("Error:", error);
			process.exit(1);
		}
	});

program
	.command("insert-between")
	.description("Insert characters for manga between two IDs")
	.argument("<startId>", "Starting manga ID")
	.argument("<endId>", "Ending manga ID")
	.action(async (mangaId: string, endId: string) => {
		const fetcher = new MangaCharactersFetcher();
		try {
			const result = await fetcher.insertBetween(
				Number.parseInt(mangaId),
				Number.parseInt(endId),
			);
			console.log(
				`✅ Completed! Processed ${result.inserted} entities | ${result.skipped} skipped | ${result.errors} errors`,
			);
		} catch (error) {
			console.error("Error:", error);
			process.exit(1);
		}
	});

program
	.command("insert-list <ids...>")
	.description(
		"Insert characters for a list of manga MAL IDs (space-separated)",
	)
	.action(async (ids: string[]) => {
		const fetcher = new MangaCharactersFetcher();
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
			const result = await fetcher.insertFromList(malIds);
			console.log(
				`✅ Completed! Processed ${result.inserted} entities | ${result.skipped} skipped | ${result.errors} errors`,
			);
		} catch (error) {
			console.error("Error:", error);
			process.exit(1);
		}
	});

program
	.command("update-list <ids...>")
	.description(
		"Update characters for a list of manga MAL IDs (space-separated)",
	)
	.action(async (ids: string[]) => {
		const fetcher = new MangaCharactersFetcher();
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
			const result = await fetcher.updateFromList(malIds);
			console.log(
				`✅ Completed! Processed ${result.inserted} entities | ${result.skipped} skipped | ${result.errors} errors`,
			);
		} catch (error) {
			console.error("Error:", error);
			process.exit(1);
		}
	});

program.parse();
