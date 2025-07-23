import { Command } from "commander";
import { handleError } from "@/fetcher-error";
import { AnimeEpisodesFetcher } from "@/fetchers/anime-episodes-fetcher";

const program = new Command();

program
	.name("jikan-anime-episodes")
	.description("CLI tool for scraping anime episode data from the Jikan API")
	.version("1.0.0");

program
	.command("insert-all")
	.description("Insert all anime episodes from the Jikan API")
	.action(async () => {
		try {
			const fetcher = new AnimeEpisodesFetcher();
			console.log("Inserting all anime episodes from Jikan API...");
			console.log("This may take a while as it processes all individual data.");

			const processed = await fetcher.insertAll();
			console.log(
				`✅ Completed! Processed ${processed.inserted} entities | ${processed.skipped} skipped | ${processed.errors} errors`,
			);
		} catch (error) {
			handleError(error);
		}
	});

program
	.command("update-all")
	.description("Update all anime episodes from the Jikan API")
	.action(async () => {
		try {
			const fetcher = new AnimeEpisodesFetcher();
			console.log("Updating all anime episodes from Jikan API...");
			console.log("This may take a while as it processes all individual data.");

			const processed = await fetcher.updateAll();
			console.log(
				`✅ Completed! Processed ${processed.updated} entities | ${processed.skipped} skipped | ${processed.errors} errors`,
			);
		} catch (error) {
			handleError(error);
		}
	});

program
	.command("insert-single <animeId>")
	.description("Insert episodes for a specific anime by MAL ID")
	.action(async (animeId: string) => {
		try {
			const fetcher = new AnimeEpisodesFetcher();
			const id = Number.parseInt(animeId, 10);
			if (Number.isNaN(id) || id <= 0) {
				console.error("Error: Anime ID must be a positive number");
				process.exit(1);
			}
			console.log(`Inserting episodes for anime ${id}...`);
			const processed = await fetcher.insertSingle(id);
			console.log(
				`✅ Completed! Processed ${processed.inserted} episodes for anime ${id} | ${processed.skipped} skipped | ${processed.errors} errors`,
			);
		} catch (error) {
			handleError(error);
		}
	});

program
	.command("insert-range [startId]")
	.description("Insert episodes for anime starting from a specific MAL ID")
	.option("-s, --start <startId>", "Starting anime ID", "1")
	.action(async (startId: string | undefined, options: { start?: string }) => {
		try {
			const fetcher = new AnimeEpisodesFetcher();
			const start = Number.parseInt(options.start || startId || "1", 10);
			if (Number.isNaN(start) || start <= 0) {
				console.error("Error: Start ID must be a positive number");
				process.exit(1);
			}
			console.log(`Inserting episodes for anime starting from ID: ${start}`);
			const processed = await fetcher.insertRange(start);
			console.log(
				`✅ Completed! Processed ${processed.inserted} episodes | ${processed.skipped} skipped | ${processed.errors} errors`,
			);
		} catch (error) {
			handleError(error);
		}
	});

program
	.command("insert-between <startId> <endId>")
	.description("Insert episodes for anime between two MAL IDs (inclusive)")
	.action(async (startId: string, endId: string) => {
		try {
			const fetcher = new AnimeEpisodesFetcher();
			const start = Number.parseInt(startId, 10);
			const end = Number.parseInt(endId, 10);
			if (Number.isNaN(start) || start <= 0 || Number.isNaN(end) || end <= 0) {
				console.error("Error: Both IDs must be positive numbers");
				process.exit(1);
			}
			if (start > end) {
				console.error("Error: Start ID cannot be greater than end ID");
				process.exit(1);
			}
			console.log(
				`Inserting episodes for anime between IDs: ${start} - ${end}`,
			);
			const processed = await fetcher.insertBetween(start, end);
			console.log(
				`✅ Completed! Processed ${processed.inserted} episodes | ${processed.skipped} skipped | ${processed.errors} errors`,
			);
		} catch (error) {
			handleError(error);
		}
	});

program
	.command("update-single <animeId>")
	.description("Update episodes for a specific anime by MAL ID")
	.action(async (animeId: string) => {
		try {
			const fetcher = new AnimeEpisodesFetcher();
			const id = Number.parseInt(animeId, 10);
			if (Number.isNaN(id) || id <= 0) {
				console.error("Error: Anime ID must be a positive number");
				process.exit(1);
			}
			console.log(`Updating episodes for anime ${id}...`);
			const processed = await fetcher.updateSingle(id);
			console.log(
				`✅ Completed! Processed ${processed.updated} episodes for anime ${id} | ${processed.skipped} skipped | ${processed.errors} errors`,
			);
		} catch (error) {
			handleError(error);
		}
	});

program
	.command("update-range [startId]")
	.description("Update episodes for anime starting from a specific MAL ID")
	.option("-s, --start <startId>", "Starting anime ID", "1")
	.action(async (startId: string | undefined, options: { start?: string }) => {
		try {
			const fetcher = new AnimeEpisodesFetcher();
			const start = Number.parseInt(options.start || startId || "1", 10);
			if (Number.isNaN(start) || start <= 0) {
				console.error("Error: Start ID must be a positive number");
				process.exit(1);
			}
			console.log(`Updating episodes for anime starting from ID: ${start}`);
			const processed = await fetcher.updateRange(start);
			console.log(
				`✅ Completed! Processed ${processed.updated} episodes | ${processed.skipped} skipped | ${processed.errors} errors`,
			);
		} catch (error) {
			handleError(error);
		}
	});

program
	.command("update-between <startId> <endId>")
	.description("Update episodes for anime between two MAL IDs (inclusive)")
	.action(async (startId: string, endId: string) => {
		try {
			const fetcher = new AnimeEpisodesFetcher();
			const start = Number.parseInt(startId, 10);
			const end = Number.parseInt(endId, 10);
			if (Number.isNaN(start) || start <= 0 || Number.isNaN(end) || end <= 0) {
				console.error("Error: Both IDs must be positive numbers");
				process.exit(1);
			}
			if (start > end) {
				console.error("Error: Start ID cannot be greater than end ID");
				process.exit(1);
			}
			console.log(`Updating episodes for anime between IDs: ${start} - ${end}`);
			const processed = await fetcher.updateBetween(start, end);
			console.log(
				`✅ Completed! Processed ${processed.updated} episodes | ${processed.skipped} skipped | ${processed.errors} errors`,
			);
		} catch (error) {
			handleError(error);
		}
	});

program
	.command("insert-list <ids...>")
	.description("Insert episodes for a list of anime MAL IDs (space-separated)")
	.action(async (ids: string[]) => {
		try {
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
			console.log(`Inserting episodes for anime IDs: ${malIds.join(", ")}`);
			const processed = await fetcher.insertFromList(malIds);
			console.log(
				`✅ Completed! Processed ${processed.inserted} episodes | ${processed.skipped} skipped | ${processed.errors} errors`,
			);
		} catch (error) {
			handleError(error);
		}
	});

program
	.command("update-list <ids...>")
	.description("Update episodes for a list of anime MAL IDs (space-separated)")
	.action(async (ids: string[]) => {
		try {
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
			console.log(`Updating episodes for anime IDs: ${malIds.join(", ")}`);
			const processed = await fetcher.updateFromList(malIds);
			console.log(
				`✅ Completed! Processed ${processed.updated} episodes | ${processed.skipped} skipped | ${processed.errors} errors`,
			);
		} catch (error) {
			handleError(error);
		}
	});

program.parse();
