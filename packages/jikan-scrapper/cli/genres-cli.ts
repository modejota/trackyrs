import { Command } from "commander";
import { handleError } from "@/fetcher-error";
import { GenresFetcher } from "@/fetchers/genres-fetcher";

const program = new Command();

program
	.name("jikan-genres")
	.description("CLI tool for scraping genre data from the Jikan API")
	.version("1.0.0");

program
	.command("insert-anime")
	.description("Insert all anime genres from the Jikan API")
	.action(async () => {
		try {
			const fetcher = new GenresFetcher();

			console.log("🎬 Inserting all anime genres...");
			const processed = await fetcher.insertAll("anime");
			console.log(
				`✅ Completed! Processed ${processed.inserted} anime genres | ${processed.skipped} skipped | ${processed.errors} errors`,
			);
		} catch (error) {
			handleError(error);
		}
	});

program
	.command("insert-manga")
	.description("Insert all manga genres from the Jikan API")
	.action(async () => {
		try {
			const fetcher = new GenresFetcher();

			console.log("📚 Inserting all manga genres...");
			const processed = await fetcher.insertAll("manga");
			console.log(
				`✅ Completed! Processed ${processed.inserted} manga genres | ${processed.skipped} skipped | ${processed.errors} errors`,
			);
		} catch (error) {
			handleError(error);
		}
	});

program
	.command("insert-all")
	.description("Insert all genres for both anime and manga")
	.action(async () => {
		try {
			const fetcher = new GenresFetcher();

			console.log("🎬 Inserting all anime genres...");
			const animeProcessed = await fetcher.insertAll("anime");
			console.log(
				`✅ Anime genres completed! Processed ${animeProcessed.inserted} genres | ${animeProcessed.skipped} skipped | ${animeProcessed.errors} errors`,
			);

			console.log("📚 Inserting all manga genres...");
			const mangaProcessed = await fetcher.insertAll("manga");
			console.log(
				`✅ Manga genres completed! Processed ${mangaProcessed.inserted} genres | ${mangaProcessed.skipped} skipped | ${mangaProcessed.errors} errors`,
			);

			const totalProcessed = animeProcessed.inserted + mangaProcessed.inserted;
			console.log(
				`🎉 All genres completed! Total processed: ${totalProcessed} genres | ${animeProcessed.skipped + mangaProcessed.skipped} skipped | ${animeProcessed.errors + mangaProcessed.errors} errors`,
			);
		} catch (error) {
			handleError(error);
		}
	});

program.parse();
