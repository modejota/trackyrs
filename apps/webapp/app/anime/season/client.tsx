"use client";

import type { Season } from "@trackyrs/database/types/anime-with-relations";
import { Button } from "@trackyrs/ui/components/button";
import { generateArray } from "@trackyrs/utils/src/react-list-key-generator";
import { AlertCircle, RefreshCw, Search } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { AnimeCard } from "@/app/anime/_components/anime-card";
import { useAvailableYears, useSeasonalAnime } from "@/app/api/anime/queries";
import { SeasonSelector } from "@/components/season-selector";
import { CardSkeleton } from "@/components/skeletons/card-skeleton";
import { getCurrentSeasonAndYear } from "@/lib/season-utils";

export default function ClientAnimeSeason() {
	const defaults = useMemo(() => getCurrentSeasonAndYear(), []);
	const [selectedSeason, setSelectedSeason] = useState<Season>(defaults.season);
	const [selectedYear, setSelectedYear] = useState<number>(defaults.year);

	const { data, isLoading, isError, error, refetch } = useSeasonalAnime(
		selectedSeason,
		selectedYear,
	);

	const { data: yearsData } = useAvailableYears();

	const availableYears = useMemo(() => yearsData ?? [], [yearsData]);

	const handleSeasonChange = useCallback((season: Season, year: number) => {
		setSelectedSeason(season);
		setSelectedYear(year);
	}, []);

	return (
		<main className="container mx-auto px-4 py-8">
			<div className="space-y-6">
				<header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="font-bold text-3xl">Seasonal Anime</h1>
						<p className="text-muted-foreground">
							Browse anime by season and year
						</p>
					</div>
					<SeasonSelector
						currentSeason={selectedSeason}
						currentYear={selectedYear}
						availableYears={availableYears}
						onSeasonChange={handleSeasonChange}
					/>
				</header>

				{/* Loading */}
				{isLoading && (
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
						{generateArray("season-anime-card-skeleton", 12).map((key) => (
							<CardSkeleton key={key} />
						))}
					</div>
				)}

				{/* Error */}
				{!isLoading && isError && (
					<div className="py-12 text-center" role="alert">
						<div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
							<AlertCircle className="h-12 w-12 text-destructive" />
						</div>
						<h3 className="mb-2 font-medium text-base text-destructive sm:text-lg">
							Failed to Load Anime
						</h3>
						<p className="mx-auto max-w-md text-muted-foreground text-sm">
							{error?.message || "An unexpected error occurred."}
						</p>
						<Button
							onClick={() => refetch()}
							variant="outline"
							size="sm"
							className="mt-4"
						>
							<RefreshCw className="mr-2 h-4 w-4" /> Try Again
						</Button>
					</div>
				)}

				{/* Results / Empty state */}
				{!isLoading &&
					!isError &&
					((data?.animes?.length ?? 0) === 0 ? (
						<div className="py-16 text-center">
							<div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-muted p-6">
								<Search className="h-10 w-10 text-muted-foreground" />
							</div>
							<h3 className="mb-2 font-semibold text-lg">No Anime Found</h3>
							<p className="mx-auto max-w-md text-muted-foreground text-sm">
								We couldn&apos;t find any anime for {selectedSeason}{" "}
								{selectedYear}.
							</p>
							<p className="mx-auto max-w-md text-muted-foreground text-sm">
								Try choosing a different season or year.
							</p>
							<div className="mt-6 flex items-center justify-center gap-2">
								<Button
									onClick={() => {
										setSelectedSeason(defaults.season);
										setSelectedYear(defaults.year);
									}}
									size="sm"
								>
									Go to current season
								</Button>
							</div>
						</div>
					) : (
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
							{(data?.animes ?? []).map((anime, index) => (
								<AnimeCard key={anime.id} anime={anime} priority={index < 6} />
							))}
						</div>
					))}
			</div>
		</main>
	);
}
