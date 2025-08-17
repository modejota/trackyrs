"use client";

import { Season } from "@trackyrs/database/types/anime-with-relations";
import { Button } from "@trackyrs/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@trackyrs/ui/components/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useCallback } from "react";

interface SeasonSelectorProps {
	currentSeason: Season;
	currentYear: number;
	availableYears: number[];
	onSeasonChange: (season: Season, year: number) => void;
}

const SEASON_LABELS = {
	winter: "Winter",
	spring: "Spring",
	summer: "Summer",
	fall: "Fall",
} as const;

const SEASONS = Object.values(Season);

export function SeasonSelector({
	currentSeason,
	currentYear,
	availableYears,
	onSeasonChange,
}: SeasonSelectorProps) {
	const handleSeasonSelect = useCallback(
		(season: Season) => {
			onSeasonChange(season, currentYear);
		},
		[currentYear, onSeasonChange],
	);

	const handleYearSelect = useCallback(
		(year: number) => {
			onSeasonChange(currentSeason, year);
		},
		[currentSeason, onSeasonChange],
	);

	return (
		<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
			{/* Season Selector */}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="outline"
						className="w-full justify-between sm:w-32"
						aria-label={`Current season: ${SEASON_LABELS[currentSeason]}`}
					>
						{SEASON_LABELS[currentSeason]}
						<ChevronDown className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" className="w-32">
					<DropdownMenuLabel>Season</DropdownMenuLabel>
					<DropdownMenuSeparator />
					{SEASONS.map((season) => (
						<DropdownMenuItem
							key={season}
							onClick={() => handleSeasonSelect(season)}
							className={currentSeason === season ? "bg-accent" : ""}
						>
							{SEASON_LABELS[season]}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Year Selector */}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="outline"
						className="w-full justify-between sm:w-20"
						aria-label={`Current year: ${currentYear}`}
					>
						{currentYear}
						<ChevronDown className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="start"
					className="max-h-60 w-20 overflow-y-auto"
				>
					<DropdownMenuLabel>Year</DropdownMenuLabel>
					<DropdownMenuSeparator />
					{availableYears.map((year) => (
						<DropdownMenuItem
							key={year}
							onClick={() => handleYearSelect(year)}
							className={currentYear === year ? "bg-accent" : ""}
						>
							{year}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
