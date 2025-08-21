import ClientTopAnime from "@/app/anime/top/client";

export default function TopAnimePage() {
	return (
		<main className="container mx-auto px-4 py-8">
			<div className="mb-6">
				<h1 className="font-bold text-3xl">Top Anime</h1>
				<p className="text-muted-foreground">Ordered by the users reviews</p>
			</div>
			<ClientTopAnime />
		</main>
	);
}
