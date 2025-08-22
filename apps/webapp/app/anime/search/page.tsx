"use client";

import { AnimeSearchClient } from "@/app/anime/search/client";
import { useAvailableGenres, useAvailableYears } from "@/app/api/anime/queries";

export default function AnimeSearchPage() {
	const { data: yearsData } = useAvailableYears();
	const { data: genresData } = useAvailableGenres();

	const genres: string[] = (genresData ?? []).filter(
		(g) => g !== null && g !== undefined,
	) as string[];
	const years: number[] = (yearsData ?? []).filter(
		(y) => y !== null && y !== undefined,
	) as number[];

	return (
		<main className="container mx-auto px-4 py-8">
			<div className="mb-4">
				<h1 className="font-bold text-3xl">Search Anime</h1>
				<p className="text-muted-foreground">
					Find your favorite anime with advanced search filters
				</p>
			</div>

			<AnimeSearchClient initialGenres={genres} initialYears={years} />
		</main>
	);
}
