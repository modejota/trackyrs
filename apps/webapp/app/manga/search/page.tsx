import { MangaSearchClient } from "@/app/manga/search/client";

export default async function MangaSearchPage() {
	const base = process.env.NEXT_PUBLIC_HONO_SERVER_URL as string;

	const [genresRes, yearsRes] = await Promise.all([
		fetch(`${base}/api/manga/genres`, {
			next: { revalidate: 60 * 60 * 24 * 30 },
		}),
		fetch(`${base}/api/manga/years`, {
			next: { revalidate: 60 * 60 * 24 * 30 },
		}),
	]);

	let genres: string[] = [];
	let years: number[] = [];

	if (genresRes.ok) {
		const json = await genresRes.json();
		if (json?.success && json?.data?.genres) {
			genres = json.data.genres as string[];
		}
	}

	if (yearsRes.ok) {
		const json = await yearsRes.json();
		if (json?.success && json?.data?.years) {
			years = (json.data.years as number[]).filter(
				(y) => y !== null && y !== undefined,
			);
		}
	}

	return (
		<main className="container mx-auto px-4 py-8">
			<div className="mb-4">
				<h1 className="font-bold text-3xl">Search Manga</h1>
				<p className="text-muted-foreground">
					Find your favorite manga with advanced search filters
				</p>
			</div>

			<MangaSearchClient initialGenres={genres} initialYears={years} />
		</main>
	);
}
