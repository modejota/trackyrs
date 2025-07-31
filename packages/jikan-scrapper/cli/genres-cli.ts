import { Command } from "commander";
import { GenresFetcher } from "@/fetchers/genres-fetcher";

const program = new Command();

program
	.name("jikan-genres")
	.description("CLI tool for scraping genre data from the Jikan API")
	.version("1.0.0");

program
	.command("upsert-anime")
	.description(
		"Upsert all anime genres from the Jikan API (insert new or update existing)",
	)
	.action(async () => {
		const fetcher = new GenresFetcher();

		console.log("🎬 Upserting all anime genres...");
		const processed = await fetcher.upsertAll("anime");
		console.log(
			`✅ Completed! Processed ${processed.inserted} inserted | ${processed.updated} updated | ${processed.skipped} skipped | ${processed.errors} errors`,
		);
	});

program
	.command("upsert-manga")
	.description(
		"Upsert all manga genres from the Jikan API (insert new or update existing)",
	)
	.action(async () => {
		const fetcher = new GenresFetcher();

		console.log("📚 Upserting all manga genres...");
		const processed = await fetcher.upsertAll("manga");
		console.log(
			`✅ Completed! Processed ${processed.inserted} inserted | ${processed.updated} updated | ${processed.skipped} skipped | ${processed.errors} errors`,
		);
	});

program
	.command("upsert-all")
	.description(
		"Upsert all genres for both anime and manga (insert new or update existing)",
	)
	.action(async () => {
		const fetcher = new GenresFetcher();

		console.log("🎬 Upserting all anime genres...");
		const animeProcessed = await fetcher.upsertAll("anime");
		console.log(
			`✅ Anime genres completed! Processed ${animeProcessed.inserted} inserted | ${animeProcessed.updated} updated | ${animeProcessed.skipped} skipped | ${animeProcessed.errors} errors`,
		);

		console.log("📚 Upserting all manga genres...");
		const mangaProcessed = await fetcher.upsertAll("manga");
		console.log(
			`✅ Manga genres completed! Processed ${mangaProcessed.inserted} inserted | ${mangaProcessed.updated} updated | ${mangaProcessed.skipped} skipped | ${mangaProcessed.errors} errors`,
		);

		const totalInserted = animeProcessed.inserted + mangaProcessed.inserted;
		const totalUpdated = animeProcessed.updated + mangaProcessed.updated;
		console.log(
			`🎉 All genres completed! Total processed: ${totalInserted} inserted | ${totalUpdated} updated | ${animeProcessed.skipped + mangaProcessed.skipped} skipped | ${animeProcessed.errors + mangaProcessed.errors} errors`,
		);
	});

program.parse();
