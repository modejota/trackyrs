"use client";

import {
	AnimeStatus,
	AnimeType,
	Season,
} from "@trackyrs/database/types/anime-with-relations";
import { Button } from "@trackyrs/ui/components/button";
import { Card, CardContent } from "@trackyrs/ui/components/card";
import { Input } from "@trackyrs/ui/components/input";
import { Label } from "@trackyrs/ui/components/label";
import MultipleSelector, {
	type Option,
} from "@trackyrs/ui/components/multiselect";
import { CircleX, Search, Search as SearchIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimeCard } from "@/app/anime/_components/anime-card";
import { useInfiniteAnimeSearch } from "@/app/api/anime/queries";
import type { AnimeSearchCriteria } from "@/app/api/anime/types";

interface AnimeSearchClientProps {
	initialGenres: string[];
	initialYears: number[];
}

const placeholderCount = 20;

const seasonOptions: Option[] = [
	{ value: Season.WINTER, label: "Winter" },
	{ value: Season.SPRING, label: "Spring" },
	{ value: Season.SUMMER, label: "Summer" },
	{ value: Season.FALL, label: "Fall" },
];

const typeOptions: Option[] = [
	{ value: AnimeType.TV, label: AnimeType.TV },
	{ value: AnimeType.OVA, label: AnimeType.OVA },
	{ value: AnimeType.MOVIE, label: AnimeType.MOVIE },
	{ value: AnimeType.SPECIAL, label: AnimeType.SPECIAL },
	{ value: AnimeType.ONA, label: AnimeType.ONA },
	{ value: AnimeType.MUSIC, label: AnimeType.MUSIC },
	{ value: AnimeType.CM, label: AnimeType.CM },
	{ value: AnimeType.PV, label: AnimeType.PV },
	{ value: AnimeType.TV_SPECIAL, label: AnimeType.TV_SPECIAL },
];

const statusOptions: Option[] = [
	{ value: AnimeStatus.CURRENTLY_AIRING, label: AnimeStatus.CURRENTLY_AIRING },
	{ value: AnimeStatus.FINISHED_AIRING, label: AnimeStatus.FINISHED_AIRING },
	{ value: AnimeStatus.NOT_YET_AIRED, label: AnimeStatus.NOT_YET_AIRED },
];

export function AnimeSearchClient({
	initialGenres,
	initialYears,
}: AnimeSearchClientProps) {
	const [criteria, setCriteria] = useState<AnimeSearchCriteria>({});
	const observerRef = useRef<HTMLDivElement | null>(null);
	const debounceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

	const genres = initialGenres ?? [];
	const years = initialYears ?? [];

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
	} = useInfiniteAnimeSearch(criteria);

	const allAnimes = data?.pages.flatMap((page) => page.animes) ?? [];

	const uniqueAnimes = allAnimes.filter(
		(anime, index, self) => index === self.findIndex((a) => a.id === anime.id),
	);

	const handleCriteriaChange = useCallback(
		(newCriteria: Partial<AnimeSearchCriteria>) => {
			setCriteria((prev) => {
				const updated = { ...prev, ...newCriteria };

				if (debounceTimeoutRef.current) {
					clearTimeout(debounceTimeoutRef.current);
				}

				return updated;
			});
		},
		[],
	);

	const handleReset = useCallback(() => {
		setCriteria({});
		if (debounceTimeoutRef.current) {
			clearTimeout(debounceTimeoutRef.current);
		}
	}, []);

	const handleGenreChange = useCallback(
		(selectedOptions: Option[]) => {
			handleCriteriaChange({
				genres: selectedOptions.map((option) => option.value),
			});
		},
		[handleCriteriaChange],
	);

	const handleYearChange = useCallback(
		(selectedOptions: Option[]) => {
			handleCriteriaChange({
				years: selectedOptions.map((option) =>
					Number.parseInt(option.value, 10),
				),
			});
		},
		[handleCriteriaChange],
	);

	const handleSeasonChange = useCallback(
		(selectedOptions: Option[]) => {
			handleCriteriaChange({
				seasons: selectedOptions.map((option) => option.value as Season),
			});
		},
		[handleCriteriaChange],
	);

	const handleTypeChange = useCallback(
		(selectedOptions: Option[]) => {
			handleCriteriaChange({
				types: selectedOptions.map((option) => option.value as AnimeType),
			});
		},
		[handleCriteriaChange],
	);

	const handleStatusChange = useCallback(
		(selectedOptions: Option[]) => {
			handleCriteriaChange({
				statuses: selectedOptions.map((option) => option.value as AnimeStatus),
			});
		},
		[handleCriteriaChange],
	);

	const genreOptions: Option[] = genres.map((genre) => ({
		value: genre,
		label: genre,
	}));
	const selectedGenreOptions: Option[] = (criteria.genres || []).map(
		(genre) => ({ value: genre, label: genre }),
	);

	const yearOptions: Option[] = years.map((year) => ({
		value: String(year),
		label: String(year),
	}));
	const selectedYearOptions: Option[] = (criteria.years || []).map((year) => ({
		value: String(year),
		label: String(year),
	}));

	const selectedSeasonOptions: Option[] = (criteria.seasons || []).map(
		(season) => ({ value: season || "", label: season || "" }),
	);

	const selectedTypeOptions: Option[] = (criteria.types || []).map((type) => ({
		value: type || "",
		label: type || "",
	}));

	const selectedStatusOptions: Option[] = (criteria.statuses || []).map(
		(status) => ({ value: status || "", label: status || "" }),
	);

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (debounceTimeoutRef.current) {
				clearTimeout(debounceTimeoutRef.current);
			}
		};
	}, []);

	// Infinite scroll observer
	useEffect(() => {
		if (!observerRef.current) return;
		const el = observerRef.current;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{ threshold: 0.2 },
		);

		observer.observe(el);
		return () => {
			observer.unobserve(el);
		};
	}, [fetchNextPage, hasNextPage, isFetchingNextPage]);

	return (
		<div className="space-y-6">
			{/* Search Filters */}
			<Card className="border-0 bg-transparent shadow-none">
				<CardContent className="space-y-4 p-0">
					<div className="grid w-full grid-cols-1 items-end gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-8">
						{/* Title */}
						<div className="flex w-full flex-col space-y-2 xl:col-span-2">
							<Label htmlFor="title" className="text-muted-foreground text-sm">
								Title
							</Label>
							<div className="relative w-full">
								<SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 z-10 h-4 w-4 transform text-muted-foreground" />
								<Input
									id="title"
									placeholder="Type an anime title..."
									value={criteria.title || ""}
									onChange={(e) =>
										handleCriteriaChange({ title: e.target.value })
									}
									className="h-[38px] border border-input bg-white py-0 pl-10 leading-[38px]"
								/>
							</div>
						</div>

						{/* Genre */}
						<div className="flex w-full flex-col space-y-2">
							<Label className="text-muted-foreground text-sm">Genres</Label>
							<MultipleSelector
								value={selectedGenreOptions}
								onChange={handleGenreChange}
								defaultOptions={genreOptions}
								placeholder="Select genres..."
								commandProps={{
									label: "Select genres",
								}}
								emptyIndicator={
									<p className="text-center text-sm">No genres found</p>
								}
								hideClearAllButton={false}
								hidePlaceholderWhenSelected={true}
								className="min-h-[38px]"
							/>
						</div>

						{/* Season */}
						<div className="flex w-full flex-col space-y-2">
							<Label htmlFor="title" className="text-muted-foreground text-sm">
								Season
							</Label>
							<MultipleSelector
								value={selectedSeasonOptions}
								onChange={handleSeasonChange}
								defaultOptions={seasonOptions}
								placeholder="Select seasons..."
								commandProps={{
									label: "Select seasons",
								}}
								emptyIndicator={
									<p className="text-center text-sm">No seasons found</p>
								}
								hideClearAllButton={false}
								hidePlaceholderWhenSelected={true}
								className="min-h-[38px]"
							/>
						</div>

						{/* Year */}
						<div className="flex w-full flex-col space-y-2">
							<Label htmlFor="year" className="text-muted-foreground text-sm">
								Year
							</Label>
							<MultipleSelector
								value={selectedYearOptions}
								onChange={handleYearChange}
								defaultOptions={yearOptions}
								placeholder="Select years..."
								commandProps={{
									label: "Select years",
								}}
								emptyIndicator={
									<p className="text-center text-sm">No years found</p>
								}
								hideClearAllButton={false}
								hidePlaceholderWhenSelected={true}
								className="min-h-[38px]"
							/>
						</div>

						{/* Format */}
						<div className="flex w-full flex-col space-y-2">
							<Label htmlFor="format" className="text-muted-foreground text-sm">
								Format
							</Label>
							<MultipleSelector
								value={selectedTypeOptions}
								onChange={handleTypeChange}
								defaultOptions={typeOptions}
								placeholder="Select formats..."
								commandProps={{
									label: "Select formats",
								}}
								emptyIndicator={
									<p className="text-center text-sm">No formats found</p>
								}
								hideClearAllButton={false}
								hidePlaceholderWhenSelected={true}
								className="min-h-[38px]"
							/>
						</div>

						{/* Airing Status */}
						<div className="flex w-full flex-col space-y-2">
							<Label htmlFor="status" className="text-muted-foreground text-sm">
								Airing Status
							</Label>
							<MultipleSelector
								value={selectedStatusOptions}
								onChange={handleStatusChange}
								defaultOptions={statusOptions}
								placeholder="Select statuses..."
								commandProps={{
									label: "Select statuses",
								}}
								emptyIndicator={
									<p className="text-center text-sm">No statuses found</p>
								}
								hideClearAllButton={false}
								hidePlaceholderWhenSelected={true}
								className="min-h-[38px]"
							/>
						</div>

						{/* Reset Button */}
						<div className="flex w-full flex-col space-y-2">
							<Button
								variant="outline"
								onClick={handleReset}
								className="h-[38px] w-full xl:w-1/2"
							>
								Reset
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Search Results */}
			{Object.values(criteria).some(
				(val) =>
					val !== undefined &&
					val !== "" &&
					(Array.isArray(val) ? val.length > 0 : true),
			) && (
				<div className="space-y-4">
					{isLoading ? null : isError ? (
						<div className="text-center">
							<div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-muted p-6">
								<CircleX className="h-10 w-10 text-muted-foreground" />
							</div>
							<h3 className="mb-2 font-semibold text-lg text-red-500">
								Failed to load search results
							</h3>
						</div>
					) : uniqueAnimes.length === 0 ? (
						<div className="text-center">
							<div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-muted p-6">
								<Search className="h-10 w-10 text-muted-foreground" />
							</div>
							<h3 className="mb-2 font-semibold text-lg">
								No anime found with the specified filters
							</h3>
						</div>
					) : (
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
							{uniqueAnimes.map((anime) => (
								<AnimeCard key={anime.id} anime={anime} />
							))}

							{isFetchingNextPage &&
								Array.from({ length: placeholderCount }).map((_, index) => (
									<div
										key={`placeholder-${data?.pages.length || 0}-${index}`}
										className="animate-pulse"
									>
										<div className="h-64 w-full rounded-lg bg-muted/30" />
									</div>
								))}
						</div>
					)}

					{hasNextPage && (
						<div
							ref={observerRef}
							className="flex h-10 items-center justify-center"
						>
							{isFetchingNextPage && (
								<div className="flex items-center gap-2">
									<div className="h-4 w-4 animate-spin rounded-full border-primary border-b-2" />
								</div>
							)}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
