import { Command } from "commander";
import { handleError } from "@/fetcher-error";
import { PeopleFetcher } from "@/fetchers/people-fetcher";

const program = new Command();

program
	.name("jikan-people")
	.description("CLI tool for scraping people data from the Jikan API")
	.version("1.0.0");

program
	.command("insert-all")
	.description("Insert all people from the Jikan API")
	.action(async () => {
		try {
			const fetcher = new PeopleFetcher();
			console.log("Inserting all people from Jikan API...");
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
	.description("Update all people from the Jikan API")
	.action(async () => {
		try {
			const fetcher = new PeopleFetcher();
			console.log("Updating all people from Jikan API...");
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
	.description("Insert a single person by MAL ID")
	.action(async (id: string) => {
		try {
			const fetcher = new PeopleFetcher();
			const malId = Number.parseInt(id, 10);

			if (Number.isNaN(malId) || malId <= 0) {
				console.error("Error: ID must be a positive number");
				process.exit(1);
			}

			console.log(`Inserting person with ID: ${malId}`);
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
	.description("Insert people starting from ID until no more entries found")
	.option("-s, --start <id>", "Starting MAL ID", "1")
	.action(async (startId: string | undefined, options: { start?: string }) => {
		try {
			const fetcher = new PeopleFetcher();
			const start = Number.parseInt(options.start || startId || "1", 10);

			if (Number.isNaN(start) || start <= 0) {
				console.error("Error: Start ID must be a positive number");
				process.exit(1);
			}

			console.log(`Inserting people starting from ID: ${start}`);
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
	.description("Insert people between two MAL IDs (inclusive)")
	.action(async (startId: string, endId: string) => {
		try {
			const fetcher = new PeopleFetcher();
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

			console.log(`Inserting people between IDs: ${start} - ${end}`);
			const processed = await fetcher.insertBetween(start, end);
			console.log(
				`✅ Completed! Processed ${processed.inserted} entities | ${processed.skipped} skipped | ${processed.errors} errors`,
			);
		} catch (error) {
			handleError(error);
		}
	});

program
	.command("update-single <id>")
	.description("Update a single person by MAL ID")
	.action(async (id: string) => {
		try {
			const fetcher = new PeopleFetcher();
			const malId = Number.parseInt(id, 10);

			if (Number.isNaN(malId) || malId <= 0) {
				console.error("Error: ID must be a positive number");
				process.exit(1);
			}

			console.log(`Updating person with ID: ${malId}`);
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
	.description("Update people starting from ID until no more entries found")
	.option("-s, --start <id>", "Starting MAL ID", "1")
	.action(async (startId: string | undefined, options: { start?: string }) => {
		try {
			const fetcher = new PeopleFetcher();
			const start = Number.parseInt(options.start || startId || "1", 10);

			if (Number.isNaN(start) || start <= 0) {
				console.error("Error: Start ID must be a positive number");
				process.exit(1);
			}

			console.log(`Updating people starting from ID: ${start}`);
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
	.description("Update people between two MAL IDs (inclusive)")
	.action(async (startId: string, endId: string) => {
		try {
			const fetcher = new PeopleFetcher();
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

			console.log(`Updating people between IDs: ${start} - ${end}`);
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
	.description("Insert people for a list of MAL IDs (space-separated)")
	.action(async (ids: string[]) => {
		try {
			const fetcher = new PeopleFetcher();
			const malIds = ids
				.map((id) => Number.parseInt(id, 10))
				.filter((id) => !Number.isNaN(id) && id > 0);
			if (malIds.length === 0) {
				console.error(
					"Error: At least one valid positive MAL ID must be provided",
				);
				process.exit(1);
			}
			console.log(`Inserting people for IDs: ${malIds.join(", ")}`);
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
	.description("Update people for a list of MAL IDs (space-separated)")
	.action(async (ids: string[]) => {
		try {
			const fetcher = new PeopleFetcher();
			const malIds = ids
				.map((id) => Number.parseInt(id, 10))
				.filter((id) => !Number.isNaN(id) && id > 0);
			if (malIds.length === 0) {
				console.error(
					"Error: At least one valid positive MAL ID must be provided",
				);
				process.exit(1);
			}
			console.log(`Updating people for IDs: ${malIds.join(", ")}`);
			const processed = await fetcher.updateFromList(malIds);
			console.log(
				`✅ Completed! Processed ${processed.updated} entities | ${processed.skipped} skipped | ${processed.errors} errors`,
			);
		} catch (error) {
			handleError(error);
		}
	});

program.parse();
