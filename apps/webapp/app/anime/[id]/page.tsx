import { notFound } from "next/navigation";
import ClientAnimeDetail from "./client";

interface AnimeDetailPageProps {
	params: Promise<{ id: string }>;
}

export default async function AnimeDetailPage({
	params,
}: AnimeDetailPageProps) {
	const { id } = await params;

	const animeId = Number.parseInt(id, 10);
	if (Number.isNaN(animeId)) {
		notFound();
	}

	return <ClientAnimeDetail animeId={animeId} />;
}
