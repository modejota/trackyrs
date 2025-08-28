"use client";

import { Season } from "@trackyrs/database/types/anime-with-relations";
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
import { ChevronDown, ChevronRight, Search as SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useAvailableGenres, useAvailableYears } from "@/app/api/anime/queries";
import type { ProfileAnimeLists } from "@/app/api/profile/types";
import { AnimeListTable } from "@/app/profile/_components/anime-list-table";

interface AnimeTabProps {
	animeLists?: ProfileAnimeLists;
	isLoading?: boolean;
}

const seasonOptions: Option[] = [
	{ value: Season.WINTER, label: "Winter" },
	{ value: Season.SPRING, label: "Spring" },
	{ value: Season.SUMMER, label: "Summer" },
	{ value: Season.FALL, label: "Fall" },
];

type SearchCriteria = {
	title: string;
	seasons: Option[];
	years: Option[];
	genres: Option[];
};

export function AnimeTab({ animeLists, isLoading }: AnimeTabProps) {
	const [criteria, setCriteria] = useState<SearchCriteria>({
		title: "",
		seasons: [],
		years: [],
		genres: [],
	});

	const { data: yearsData } = useAvailableYears();
	const { data: genresData } = useAvailableGenres();
	const allYears: number[] = useMemo(
		() => (yearsData ?? []).filter((y) => y != null) as number[],
		[yearsData],
	);
	const allGenres: string[] = useMemo(
		() => (genresData ?? []).filter((g) => g != null) as string[],
		[genresData],
	);

	const yearOptions: Option[] = useMemo(
		() => allYears.map((y) => ({ value: String(y), label: String(y) })),
		[allYears],
	);
	const genreOptions: Option[] = useMemo(
		() => allGenres.map((g) => ({ value: g, label: g })),
		[allGenres],
	);

	const filterItems = (items: any[] = []) => {
		return items.filter((it) => {
			if (
				criteria.title &&
				!it.title?.toLowerCase().includes(criteria.title.toLowerCase())
			)
				return false;
			if (
				criteria.seasons.length > 0 &&
				!criteria.seasons.some((s) => s.value === it.season)
			)
				return false;
			if (
				criteria.years.length > 0 &&
				!criteria.years.some((y) => Number(y.value) === it.year)
			)
				return false;
			if (criteria.genres.length > 0) {
				const selected = new Set(criteria.genres.map((g) => g.value));
				const itemGenresRaw = (it.genres ?? []) as string[] | string;
				const itemGenres = Array.isArray(itemGenresRaw)
					? itemGenresRaw
					: itemGenresRaw
							.split(",")
							.map((s) => s.trim())
							.filter(Boolean);
				if (!itemGenres.some((g: string) => selected.has(g))) return false;
			}
			return true;
		});
	};

	const handleReset = () => {
		setCriteria({ title: "", seasons: [], years: [], genres: [] });
	};

	if (isLoading) {
		return (
			<div className="rounded-lg border bg-card p-4 sm:p-6">
				<div className="h-8 w-48 animate-pulse rounded bg-muted" />
				<div className="mt-6 h-10 w-full animate-pulse rounded bg-muted" />
				<div className="mt-4 h-64 w-full animate-pulse rounded bg-muted" />
			</div>
		);
	}

	if (!animeLists) {
		return (
			<div className="rounded-lg border bg-card p-4 sm:p-6">
				<p className="text-muted-foreground">No anime data.</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Filters */}
			{(() => {
				const Filters = () => (
					<Card className="border-0 bg-transparent shadow-none">
						<CardContent className="space-y-4 p-0">
							<div className="grid w-full grid-cols-1 items-end gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-8">
								{/* Title */}
								<div className="flex w-full flex-col space-y-2 xl:col-span-2">
									<Label
										htmlFor="title"
										className="text-muted-foreground text-sm"
									>
										Title
									</Label>
									<div className="relative w-full">
										<SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 z-10 h-4 w-4 transform text-muted-foreground" />
										<Input
											id="title"
											placeholder="Type an anime title..."
											value={criteria.title}
											onChange={(e) =>
												setCriteria((c) => ({ ...c, title: e.target.value }))
											}
											className="h-[38px] border border-input bg-background py-0 pl-10 leading-[38px]"
										/>
									</div>
								</div>

								{/* Genres */}
								<div className="flex w-full flex-col space-y-2 xl:col-span-3">
									<Label className="text-muted-foreground text-sm">
										Genres
									</Label>
									<MultipleSelector
										value={criteria.genres}
										onChange={(opts) =>
											setCriteria((c) => ({ ...c, genres: opts }))
										}
										options={genreOptions}
										placeholder="Select genres..."
										commandProps={{ label: "Select genres" }}
										emptyIndicator={
											<p className="text-center text-sm">No genres found</p>
										}
										hideClearAllButton={false}
										hidePlaceholderWhenSelected={true}
										className="min-h-[38px] bg-background"
									/>
								</div>

								{/* Season */}
								<div className="flex w-full flex-col space-y-2">
									<Label
										htmlFor="season"
										className="text-muted-foreground text-sm"
									>
										Season
									</Label>
									<MultipleSelector
										value={criteria.seasons}
										onChange={(opts) =>
											setCriteria((c) => ({ ...c, seasons: opts }))
										}
										defaultOptions={seasonOptions}
										placeholder="Select seasons..."
										commandProps={{ label: "Select seasons" }}
										emptyIndicator={
											<p className="text-center text-sm">No seasons found</p>
										}
										hideClearAllButton={false}
										hidePlaceholderWhenSelected={true}
										className="min-h-[38px] bg-background"
									/>
								</div>

								{/* Year */}
								<div className="flex w-full flex-col space-y-2 xl:col-span-1">
									<Label
										htmlFor="year"
										className="text-muted-foreground text-sm"
									>
										Year
									</Label>
									<MultipleSelector
										value={criteria.years}
										onChange={(opts) =>
											setCriteria((c) => ({ ...c, years: opts }))
										}
										options={yearOptions}
										placeholder="Select years..."
										commandProps={{ label: "Select years" }}
										emptyIndicator={
											<p className="text-center text-sm">No years found</p>
										}
										hideClearAllButton={false}
										hidePlaceholderWhenSelected={true}
										className="min-h-[38px] bg-background"
									/>
								</div>

								{/* Reset Button */}
								<div className="flex w-full flex-col space-y-2 xl:col-span-1">
									<Button
										variant="outline"
										onClick={handleReset}
										className="h-[38px] w-full bg-background"
									>
										Reset
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				);

				return (
					<>
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
					</>
				);
			})()}

			{/* Collapsible tables per status */}
			<div className="space-y-4">
				{(() => {
					const watching = filterItems(animeLists.WATCHING);
					const plan = filterItems(animeLists.PLAN_TO_WATCH);
					const completed = filterItems(animeLists.COMPLETED);
					const rewatching = filterItems(animeLists.REWATCHING);
					const paused = filterItems(animeLists.PAUSED);
					const dropped = filterItems(animeLists.DROPPED);
					return (
						<>
							<CollapsibleSection title="Watching" count={watching.length}>
								<AnimeListTable
									title="Watching"
									items={watching}
									showHeader={false}
								/>
							</CollapsibleSection>
							<CollapsibleSection title="Plan to Watch" count={plan.length}>
								<AnimeListTable
									title="Plan to Watch"
									items={plan}
									showHeader={false}
								/>
							</CollapsibleSection>
							<CollapsibleSection title="Completed" count={completed.length}>
								<AnimeListTable
									title="Completed"
									items={completed}
									showHeader={false}
								/>
							</CollapsibleSection>
							<CollapsibleSection title="Rewatching" count={rewatching.length}>
								<AnimeListTable
									title="Rewatching"
									items={rewatching}
									showHeader={false}
								/>
							</CollapsibleSection>
							<CollapsibleSection title="Paused" count={paused.length}>
								<AnimeListTable
									title="Paused"
									items={paused}
									showHeader={false}
								/>
							</CollapsibleSection>
							<CollapsibleSection title="Dropped" count={dropped.length}>
								<AnimeListTable
									title="Dropped"
									items={dropped}
									showHeader={false}
								/>
							</CollapsibleSection>
						</>
					);
				})()}
			</div>
		</div>
	);
}

function CollapsibleSection({
	title,
	count,
	children,
}: {
	title: string;
	count: number;
	children: React.ReactNode;
}) {
	const [open, setOpen] = useState(true);
	return (
		<div className="rounded-lg border bg-card">
			<button
				type="button"
				onClick={() => setOpen((o) => !o)}
				className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
			>
				<span className="flex flex-col">
					<span className="font-semibold text-lg">{title}</span>
					<span className="text-muted-foreground text-sm">{count} items</span>
				</span>
				{open ? (
					<ChevronDown className="h-4 w-4" />
				) : (
					<ChevronRight className="h-4 w-4" />
				)}
			</button>
			{open && (
				<div className="px-4 pb-4">
					<div className="pt-2">
						<div>{children}</div>
					</div>
				</div>
			)}
		</div>
	);
}
