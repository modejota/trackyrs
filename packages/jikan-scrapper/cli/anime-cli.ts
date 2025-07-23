import { Command } from "commander";
import { handleError } from "@/fetcher-error";
import { AnimeFetcher } from "@/fetchers/anime-fetcher";

const program = new Command();

program
	.name("jikan-anime")
	.description("CLI tool for scraping anime data from the Jikan API")
	.version("1.0.0");

program
	.command("insert-all")
	.description("Insert all anime from the Jikan API")
	.action(async () => {
		try {
			const fetcher = new AnimeFetcher();
			console.log("Inserting all anime from Jikan API...");
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
	.command("update-all")
	.description("Update all anime from the Jikan API")
	.action(async () => {
		try {
			const fetcher = new AnimeFetcher();
			console.log("Updating all anime from Jikan API...");
			console.log("This may take a while as it processes all paginated data.");

			const processed = await fetcher.updateAll();
			console.log(
				`✅ Completed! Processed ${processed.updated} entities | ${processed.skipped} skipped | ${processed.errors} errors`,
			);
		} catch (error) {
			handleError(error);
		}
	});

program
	.command("insert-single <id>")
	.description("Insert a single anime by MAL ID")
	.action(async (id: string) => {
		try {
			const fetcher = new AnimeFetcher();
			const malId = Number.parseInt(id, 10);

			if (Number.isNaN(malId) || malId <= 0) {
				console.error("Error: ID must be a positive number");
				process.exit(1);
			}

			console.log(`Inserting anime with ID: ${malId}`);
			const processed = await fetcher.insertSingle(malId);
			console.log(
				`✅ Completed! Processed ${processed.inserted} entity | ${processed.skipped} skipped | ${processed.errors} errors`,
			);
		} catch (error) {
			handleError(error);
		}
	});

program
	.command("insert-range [startId]")
	.description("Insert anime starting from ID until no more entries found")
	.option("-s, --start <id>", "Starting MAL ID", "1")
	.action(async (startId: string | undefined, options: { start?: string }) => {
		try {
			const fetcher = new AnimeFetcher();
			const start = Number.parseInt(options.start || startId || "1", 10);

			if (Number.isNaN(start) || start <= 0) {
				console.error("Error: Start ID must be a positive number");
				process.exit(1);
			}

			console.log(`Inserting anime starting from ID: ${start}`);
			const processed = await fetcher.insertRange(start);
			console.log(
				`✅ Completed! Processed ${processed.inserted} entities | ${processed.skipped} skipped | ${processed.errors} errors`,
			);
		} catch (error) {
			handleError(error);
		}
	});

program
	.command("insert-between <startId> <endId>")
	.description("Insert anime between two MAL IDs (inclusive)")
	.action(async (startId: string, endId: string) => {
		try {
			const fetcher = new AnimeFetcher();
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

			console.log(`Inserting anime between IDs: ${start} - ${end}`);
			const processed = await fetcher.insertBetween(start, end);
			console.log(
				`✅ Completed! Processed ${processed.inserted} entities | ${processed.skipped} skipped | ${processed.errors} errors`,
			);
		} catch (error) {
			handleError(error);
		}
	});

program
	.command("insert-season <year> <season>")
	.description("Insert anime by season (winter, spring, summer, fall)")
	.action(async (year: string, season: string) => {
		try {
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
				console.error(
					`Error: Season must be one of: ${validSeasons.join(", ")}`,
				);
				process.exit(1);
			}

			console.log(`Inserting anime for ${season} ${yearNum}`);
			const processed = await fetcher.insertBySeason(
				yearNum,
				season.toLowerCase(),
			);
			console.log(
				`✅ Completed! Processed ${processed.inserted} entities | ${processed.skipped} skipped | ${processed.errors} errors`,
			);
		} catch (error) {
			handleError(error);
		}
	});

program
	.command("update-single <id>")
	.description("Update a single anime by MAL ID")
	.action(async (id: string) => {
		try {
			const fetcher = new AnimeFetcher();
			const malId = Number.parseInt(id, 10);

			if (Number.isNaN(malId) || malId <= 0) {
				console.error("Error: ID must be a positive number");
				process.exit(1);
			}

			console.log(`Updating anime with ID: ${malId}`);
			const processed = await fetcher.updateSingle(malId);
			console.log(
				`✅ Completed! Processed ${processed.updated} entity | ${processed.skipped} skipped | ${processed.errors} errors`,
			);
		} catch (error) {
			handleError(error);
		}
	});

program
	.command("update-range [startId]")
	.description("Update anime starting from ID until no more entries found")
	.option("-s, --start <id>", "Starting MAL ID", "1")
	.action(async (startId: string | undefined, options: { start?: string }) => {
		try {
			const fetcher = new AnimeFetcher();
			const start = Number.parseInt(options.start || startId || "1", 10);

			if (Number.isNaN(start) || start <= 0) {
				console.error("Error: Start ID must be a positive number");
				process.exit(1);
			}

			console.log(`Updating anime starting from ID: ${start}`);
			const processed = await fetcher.updateRange(start);
			console.log(
				`✅ Completed! Processed ${processed.updated} entities | ${processed.skipped} skipped | ${processed.errors} errors`,
			);
		} catch (error) {
			handleError(error);
		}
	});

program
	.command("update-between <startId> <endId>")
	.description("Update anime between two MAL IDs (inclusive)")
	.action(async (startId: string, endId: string) => {
		try {
			const fetcher = new AnimeFetcher();
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

			console.log(`Updating anime between IDs: ${start} - ${end}`);
			const processed = await fetcher.updateBetween(start, end);
			console.log(
				`✅ Completed! Processed ${processed.updated} entities | ${processed.skipped} skipped | ${processed.errors} errors`,
			);
		} catch (error) {
			handleError(error);
		}
	});

program
	.command("insert-list <ids...>")
	.description("Insert anime for a list of MAL IDs (space-separated)")
	.action(async (ids: string[]) => {
		try {
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
			console.log(`Inserting anime for IDs: ${malIds.join(", ")}`);
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
	.description("Update anime for a list of MAL IDs (space-separated)")
	.action(async (ids: string[]) => {
		try {
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
			console.log(`Updating anime for IDs: ${malIds.join(", ")}`);
			const processed = await fetcher.updateFromList(malIds);
			console.log(
				`✅ Completed! Processed ${processed.updated} entities | ${processed.skipped} skipped | ${processed.errors} errors`,
			);
		} catch (error) {
			handleError(error);
		}
	});

program.parse();
