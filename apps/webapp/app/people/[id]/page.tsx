import { notFound } from "next/navigation";
import ClientPeopleDetail from "@/app/people/[id]/client";

interface PeopleDetailPageProps {
	params: Promise<{ id: string }>;
}

export default async function PeopleDetailPage({
	params,
}: PeopleDetailPageProps) {
	const { id } = await params;

	const peopleId = Number.parseInt(id, 10);
	if (Number.isNaN(peopleId)) {
		notFound();
	}

	return <ClientPeopleDetail peopleId={peopleId} />;
}
