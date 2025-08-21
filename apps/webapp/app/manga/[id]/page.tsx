import { notFound } from "next/navigation";
import ClientMangaDetail from "@/app/manga/[id]/client";

interface MangaDetailPageProps {
	params: Promise<{ id: string }>;
}

export default async function MangaDetailPage({
	params,
}: MangaDetailPageProps) {
	const { id } = await params;

	const mangaId = Number.parseInt(id, 10);
	if (Number.isNaN(mangaId)) {
		notFound();
	}

	return <ClientMangaDetail mangaId={mangaId} />;
}
