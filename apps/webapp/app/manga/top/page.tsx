import type { Metadata } from "next";
import ClientTopManga from "@/app/manga/top/client";

export const metadata: Metadata = { title: "Top Manga" };

export default function TopMangaPage() {
	return (
		<main className="container mx-auto px-4 py-8">
			<div className="mb-6">
				<h1 className="font-bold text-3xl">Top Manga</h1>
				<p className="text-muted-foreground">Ordered by the users reviews</p>
			</div>
			<ClientTopManga />
		</main>
	);
}
