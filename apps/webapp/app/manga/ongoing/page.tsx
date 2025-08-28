import type { Metadata } from "next";
import ClientOngoingManga from "@/app/manga/ongoing/client";

export const metadata: Metadata = { title: "Ongoing Manga" };

export default function OngoingMangaPage() {
	return (
		<main className="container mx-auto px-4 py-8">
			<div className="mb-6">
				<h1 className="font-bold text-3xl">Ongoing Manga</h1>
				<p className="text-muted-foreground">Currently publishing manga</p>
			</div>
			<ClientOngoingManga />
		</main>
	);
}
