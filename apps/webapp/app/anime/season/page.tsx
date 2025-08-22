"use client";

import ClientAnimeSeason from "@/app/anime/season/client";
import { useAvailableYears } from "@/app/api/anime/queries";

export default function AnimeSeasonPage() {
	const { data: yearsData } = useAvailableYears();
	const years: number[] = (yearsData ?? []).filter(
		(y) => y !== null && y !== undefined,
	) as number[];

	return <ClientAnimeSeason initialYears={years} />;
}
