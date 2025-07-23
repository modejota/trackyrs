import { Command } from "commander";
import { handleError } from "@/fetcher-error";
import { AnimeFullDetailsFetcher } from "@/fetchers/anime-full-details-fetcher";

const program = new Command();

program
	.name("anime-full-details-cli")
	.description(
		"CLI for fetching and inserting anime relationships (anime-to-anime, anime-to-manga, anime-to-genre, anime-to-producers)",
	)
	.version("1.0.0");

program
	.command("insert-all")
	.description("Insert all anime relationships from the Jikan API")
	.action(async () => {
		try {
			const fetcher = new AnimeFullDetailsFetcher();
			console.log("Inserting relationships for all anime from Jikan API...");
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
	.description("Insert relationships for a single anime by ID")
	.argument("<id>", "Anime ID to insert relationships for")
	.action(async (id: string) => {
		const animeId = Number.parseInt(id, 10);
		if (Number.isNaN(animeId)) {
			console.error("Error: Anime ID must be a valid number");
			process.exit(1);
		}

		try {
			console.log(`Updating relationships for anime ID: ${animeId}`);
			const fetcher = new AnimeFullDetailsFetcher();
			const count = await fetcher.insertSingle(animeId);
			console.log(
				`✅ Completed! Processed ${count.inserted} entities | ${count.skipped} skipped | ${count.errors} errors`,
			);
		} catch (error) {
			handleError(error);
		}
	});

program
	.command("insert-range")
	.description(
		"Insert relationships for anime starting from a specific ID until no more entries",
	)
	.argument("[startId]", "Starting anime ID (default: 1)", "1")
	.action(async (startId: string) => {
		const start = Number.parseInt(startId, 10);
		if (Number.isNaN(start)) {
			console.error("Error: Start ID must be a valid number");
			process.exit(1);
		}

		try {
			console.log(
				`Updating relationships for anime starting from ID: ${start}`,
			);
			const fetcher = new AnimeFullDetailsFetcher();
			const count = await fetcher.insertRange(start);
			console.log(
				`✅ Completed! Processed ${count.inserted} entities | ${count.skipped} skipped | ${count.errors} errors`,
			);
		} catch (error) {
			handleError(error);
		}
	});

program
	.command("insert-between")
	.description("Insert relationships for anime between two IDs (inclusive)")
	.argument("<startId>", "Starting anime ID")
	.argument("<endId>", "Ending anime ID")
	.action(async (startId: string, endId: string) => {
		const start = Number.parseInt(startId, 10);
		const end = Number.parseInt(endId, 10);

		if (Number.isNaN(start) || Number.isNaN(end)) {
			console.error("Error: Both start and end IDs must be valid numbers");
			process.exit(1);
		}

		if (start > end) {
			console.error("Error: Start ID cannot be greater than end ID");
			process.exit(1);
		}

		try {
			console.log(
				`Updating relationships for anime between IDs: ${start} - ${end}`,
			);
			const fetcher = new AnimeFullDetailsFetcher();
			const count = await fetcher.insertBetween(start, end);
			console.log(
				`✅ Completed! Processed ${count.inserted} entities | ${count.skipped} skipped | ${count.errors} errors`,
			);
		} catch (error) {
			handleError(error);
		}
	});

program
	.command("insert-list <ids...>")
	.description(
		"Insert relationships for a list of anime MAL IDs (space-separated)",
	)
	.action(async (ids: string[]) => {
		try {
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
			console.log(
				`Inserting relationships for anime IDs: ${malIds.join(", ")}`,
			);
			const processed = await fetcher.insertFromList(malIds);
			console.log(
				`✅ Completed! Processed ${processed.inserted} entities | ${processed.skipped} skipped | ${processed.errors} errors`,
			);
		} catch (error) {
			handleError(error);
		}
	});

program
	.command("update-list <ids...>")
	.description(
		"Update relationships for a list of anime MAL IDs (space-separated)",
	)
	.action(async (ids: string[]) => {
		try {
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
			console.log(`Updating relationships for anime IDs: ${malIds.join(", ")}`);
			const processed = await fetcher.updateFromList(malIds);
			console.log(
				`✅ Completed! Processed ${processed.inserted} entities | ${processed.skipped} skipped | ${processed.errors} errors`,
			);
		} catch (error) {
			handleError(error);
		}
	});

program.parse();
