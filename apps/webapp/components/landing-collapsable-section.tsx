"use client";

import type { Anime } from "@trackyrs/database/schemas/myanimelist/anime/anime-schema";
import type { Manga } from "@trackyrs/database/schemas/myanimelist/manga/manga-schema";
import { Button } from "@trackyrs/ui/components/button";
import { generateArray } from "@trackyrs/utils/src/react-list-key-generator";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { AnimeCard } from "@/app/anime/_components/anime-card";
import { TopAnimeCard } from "@/app/anime/_components/anime-top-card";
import { MangaCard } from "@/app/manga/_components/manga-card";
import { TopMangaCard } from "@/app/manga/_components/manga-top-card";
import { CardSkeleton } from "@/components/skeletons/card-skeleton";

interface LandingCollapsableSectionProps {
	title: string;
	subtitle?: string;
	items: (Anime | Manga)[];
	isLoading?: boolean;
	itemType: "anime" | "manga";
	showRanking?: boolean;
	className?: string;
}

export function LandingCollapsableSection({
	title,
	subtitle,
	items,
	isLoading = false,
	itemType,
	showRanking = false,
	className = "",
}: LandingCollapsableSectionProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	const itemsPerRow = 6;
	const visibleItems = isExpanded ? items : items.slice(0, itemsPerRow);
	const hasMoreItems = items.length > itemsPerRow;

	if (isLoading) {
		return (
			<div className={`space-y-4 ${className}`}>
				<div className="flex items-center justify-between">
					<div>
						<h2 className="font-bold text-2xl">{title}</h2>
						{subtitle && <p className="text-muted-foreground">{subtitle}</p>}
					</div>
				</div>
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
					{generateArray("landing-carousel-skeleton", 6).map((key) => (
						<CardSkeleton key={key} />
					))}
				</div>
			</div>
		);
	}

	if (items.length === 0) {
		return null;
	}

	return (
		<div className={`space-y-4 ${className}`}>
			<div className="sticky top-0 z-20 mb-6 border-b bg-background py-4">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="font-bold text-2xl">{title}</h2>
						{subtitle && <p className="text-muted-foreground">{subtitle}</p>}
					</div>
					{hasMoreItems && (
						<Button
							variant="outline"
							size="sm"
							onClick={() => setIsExpanded(!isExpanded)}
							className="flex items-center gap-2"
						>
							{isExpanded ? (
								<>
									<ChevronUp className="h-4 w-4" />
									Show Less
								</>
							) : (
								<>
									<ChevronDown className="h-4 w-4" />
									View More
								</>
							)}
						</Button>
					)}
				</div>
			</div>

			<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
				{visibleItems.map((item, index) =>
					itemType === "anime" ? (
						showRanking ? (
							<TopAnimeCard
								key={item.id}
								anime={item as Anime}
								rank={index + 1}
							/>
						) : (
							<AnimeCard key={item.id} anime={item as Anime} />
						)
					) : showRanking ? (
						<TopMangaCard
							key={item.id}
							manga={item as Manga}
							rank={index + 1}
						/>
					) : (
						<MangaCard key={item.id} manga={item as Manga} />
					),
				)}
			</div>
		</div>
	);
}
