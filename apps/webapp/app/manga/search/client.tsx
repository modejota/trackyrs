"use client";

import {
	MangaStatus,
	MangaType,
} from "@trackyrs/database/types/manga-with-relations";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@trackyrs/ui/components/accordion";
import { Button } from "@trackyrs/ui/components/button";
import { Card, CardContent } from "@trackyrs/ui/components/card";
import { Input } from "@trackyrs/ui/components/input";
import { Label } from "@trackyrs/ui/components/label";
import MultipleSelector, {
	type Option,
} from "@trackyrs/ui/components/multiselect";
import { Spinner } from "@trackyrs/ui/components/spinner";
import { generateArray } from "@trackyrs/utils/src/react-list-key-generator";
import { CircleX, Search, Search as SearchIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteMangaSearch } from "@/app/api/manga/queries";
import type { MangaSearchCriteria } from "@/app/api/manga/types";
import { MangaCard } from "@/app/manga/_components/manga-card";
import { CardSkeleton } from "@/components/skeletons/card-skeleton";

interface MangaSearchClientProps {
	initialGenres: string[];
	initialYears: number[];
}

const placeholderCount = 20;

const typeOptions: Option[] = [
	{ value: MangaType.MANGA, label: MangaType.MANGA },
	{ value: MangaType.NOVEL, label: MangaType.NOVEL },
	{ value: MangaType.LIGHT_NOVEL, label: MangaType.LIGHT_NOVEL },
	{ value: MangaType.ONE_SHOT, label: MangaType.ONE_SHOT },
	{ value: MangaType.DOUJINSHI, label: MangaType.DOUJINSHI },
	{ value: MangaType.MANHWA, label: MangaType.MANHWA },
	{ value: MangaType.MANHUA, label: MangaType.MANHUA },
];

const statusOptions: Option[] = [
	{ value: MangaStatus.FINISHED, label: MangaStatus.FINISHED },
	{ value: MangaStatus.PUBLISHING, label: MangaStatus.PUBLISHING },
	{ value: MangaStatus.ON_HIATUS, label: MangaStatus.ON_HIATUS },
	{ value: MangaStatus.DISCONTINUED, label: MangaStatus.DISCONTINUED },
	{
		value: MangaStatus.NOT_YET_PUBLISHED,
		label: MangaStatus.NOT_YET_PUBLISHED,
	},
];

export function MangaSearchClient({
	initialGenres,
	initialYears,
}: MangaSearchClientProps) {
	const [criteria, setCriteria] = useState<MangaSearchCriteria>({});
	const observerRef = useRef<HTMLDivElement | null>(null);
	const debounceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

	const genres = useMemo(() => initialGenres ?? [], [initialGenres]);
	const years = useMemo(() => initialYears ?? [], [initialYears]);

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
		refetch,
	} = useInfiniteMangaSearch(criteria);

	const allMangas = data?.pages.flatMap((page) => page.mangas) ?? [];

	const uniqueMangas = allMangas.filter(
		(manga, index, self) => index === self.findIndex((m) => m.id === manga.id),
	);

	const handleCriteriaChange = useCallback(
		(newCriteria: Partial<MangaSearchCriteria>) => {
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

	const handleTypeChange = useCallback(
		(selectedOptions: Option[]) => {
			handleCriteriaChange({
				types: selectedOptions.map((option) => option.value as MangaType),
			});
		},
		[handleCriteriaChange],
	);

	const handleStatusChange = useCallback(
		(selectedOptions: Option[]) => {
			handleCriteriaChange({
				statuses: selectedOptions.map((option) => option.value as MangaStatus),
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

	const Filters = () => (
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
								placeholder="Type a manga title..."
								value={criteria.title || ""}
								onChange={(e) =>
									handleCriteriaChange({ title: e.target.value })
								}
								className="h-[38px] border border-input bg-background py-0 pl-10 leading-[38px]"
							/>
						</div>
					</div>

					{/* Genre */}
					<div className="flex w-full flex-col space-y-2 xl:col-span-2">
						<Label className="text-muted-foreground text-sm">Genres</Label>
						<MultipleSelector
							value={selectedGenreOptions}
							onChange={handleGenreChange}
							options={genreOptions}
							placeholder="Select genres..."
							commandProps={{
								label: "Select genres",
							}}
							emptyIndicator={
								<p className="text-center text-sm">No genres found</p>
							}
							hideClearAllButton={false}
							hidePlaceholderWhenSelected={true}
							className="min-h-[38px] bg-background"
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
							options={yearOptions}
							placeholder="Select years..."
							commandProps={{
								label: "Select years",
							}}
							emptyIndicator={
								<p className="text-center text-sm">No years found</p>
							}
							hideClearAllButton={false}
							hidePlaceholderWhenSelected={true}
							className="min-h-[38px] bg-background"
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
							className="min-h-[38px] bg-background"
						/>
					</div>

					{/* Publishing Status */}
					<div className="flex w-full flex-col space-y-2">
						<Label htmlFor="status" className="text-muted-foreground text-sm">
							Publishing Status
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
							className="min-h-[38px] bg-background"
						/>
					</div>

					{/* Reset Button */}
					<div className="flex w-full flex-col space-y-2">
						<Button
							variant="outline"
							onClick={handleReset}
							className="h-[38px] w-full bg-background xl:w-1/2"
						>
							Reset
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);

	return (
		<div className="space-y-6">
			{/* Mobile: collapsible filters */}
			<div className="md:hidden">
				<Accordion type="single" collapsible defaultValue="filters">
					<AccordionItem value="filters">
						<AccordionTrigger>Filters</AccordionTrigger>
						<AccordionContent>{Filters()}</AccordionContent>
					</AccordionItem>
				</Accordion>
			</div>

			{/* Desktop: always visible filters */}
			<div className="hidden md:block">{Filters()}</div>

			{/* Search Results */}
			{Object.values(criteria).some(
				(val) =>
					val !== undefined &&
					val !== "" &&
					(Array.isArray(val) ? val.length > 0 : true),
			) && (
				<div className="space-y-4">
					{isLoading ? (
						<div className="py-12 text-center">
							<div className="mx-auto max-w-md">
								<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted p-4">
									<Spinner className="h-7 w-7 text-muted-foreground" />
								</div>
								<p className="mt-2 text-muted-foreground text-sm">
									Loading results…
								</p>
							</div>
						</div>
					) : isError ? (
						<div className="py-12 text-center">
							<div className="mx-auto max-w-md">
								<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted p-4">
									<CircleX className="h-7 w-7 text-muted-foreground" />
								</div>
								<h3 className="mb-2 font-semibold text-lg">
									Couldn’t load manga results
								</h3>
								<p className="text-muted-foreground text-sm">
									There was an error while loading manga search results. Please
									try again.
								</p>
								<div className="mt-4">
									<Button onClick={() => refetch()}>Try again</Button>
								</div>
							</div>
						</div>
					) : uniqueMangas.length === 0 ? (
						<div className="py-12 text-center">
							<div className="mx-auto max-w-md">
								<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted p-4">
									<Search className="h-7 w-7 text-muted-foreground" />
								</div>
								<h3 className="mb-2 font-semibold text-lg">No manga found</h3>
								<p className="text-muted-foreground text-sm">
									No results match your filters. Try adjusting your filters or
									search terms.
								</p>
								<div className="mt-4">
									<Button variant="outline" onClick={handleReset}>
										Reset filters
									</Button>
								</div>
							</div>
						</div>
					) : (
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
							{uniqueMangas.map((manga) => (
								<MangaCard key={manga.id} manga={manga} />
							))}

							{isFetchingNextPage &&
								generateArray(
									"loading-next-manga-search-cards",
									placeholderCount,
								).map((key) => <CardSkeleton key={key} />)}
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
