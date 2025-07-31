import { Command } from "commander";
import { MagazinesFetcher } from "@/fetchers/magazines-fetcher";

const program = new Command();

program
	.name("jikan-magazines")
	.description("CLI tool for scraping magazine data from the Jikan API")
	.version("1.0.0");

program
	.command("upsert-all")
	.description(
		"Upsert all magazines from the Jikan API (insert new or update existing)",
	)
	.action(async () => {
		const fetcher = new MagazinesFetcher();
		console.log("Upserting all magazines from Jikan API...");

		const processed = await fetcher.upsertAll();
		console.log(
			`✅ Completed! Processed ${processed.inserted} inserted | ${processed.updated} updated | ${processed.skipped} skipped | ${processed.errors} errors`,
		);
	});

program
	.command("upsert-single <id>")
	.description(
		"Upsert a single magazine by MAL ID (insert new or update existing)",
	)
	.action(async (id: string) => {
		const fetcher = new MagazinesFetcher();
		const malId = Number.parseInt(id, 10);

		if (Number.isNaN(malId) || malId <= 0) {
			console.error("Error: ID must be a positive number");
			process.exit(1);
		}

		console.log(`Upserting magazine with ID: ${malId}`);
		const processed = await fetcher.upsertSingle(malId);
		console.log(
			`✅ Completed! Processed ${processed.inserted} inserted | ${processed.updated} updated | ${processed.skipped} skipped | ${processed.errors} errors`,
		);
	});

program
	.command("upsert-range [startRowNumber]")
	.description(
		"Upsert magazines starting from startRowNumber until no more entries found (insert new or update existing)",
	)
	.option("-s, --start <id>", "Starting row number", "1")
	.action(async (startId: string | undefined, options: { start?: string }) => {
		const fetcher = new MagazinesFetcher();
		const start = Number.parseInt(options.start || startId || "1", 10);

		if (Number.isNaN(start) || start <= 0) {
			console.error("Error: Start row number must be a positive number");
			process.exit(1);
		}

		console.log(`Upserting magazines starting from row: ${start}`);
		const processed = await fetcher.upsertRange(start);
		console.log(
			`✅ Completed! Processed ${processed.inserted} inserted | ${processed.updated} updated | ${processed.skipped} skipped | ${processed.errors} errors`,
		);
	});

program.parse();
