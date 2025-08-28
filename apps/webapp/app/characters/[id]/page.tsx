import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ClientCharacterDetail from "@/app/characters/[id]/client";

export const metadata: Metadata = { title: "Character" };

interface CharacterDetailPageProps {
	params: Promise<{ id: string }>;
}

export default async function CharacterDetailPage({
	params,
}: CharacterDetailPageProps) {
	const { id } = await params;

	const characterId = Number.parseInt(id, 10);
	if (Number.isNaN(characterId)) {
		notFound();
	}

	return <ClientCharacterDetail characterId={characterId} />;
}
