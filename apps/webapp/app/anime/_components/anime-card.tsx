"use client";

import type { Anime } from "@trackyrs/database/schemas/myanimelist/anime/anime-schema";
import { Badge } from "@trackyrs/ui/components/badge";
import Image from "next/image";
import Link from "next/link";

interface AnimeCardProps {
	anime: Anime;
	priority?: boolean;
}

export function AnimeCard({ anime, priority = false }: AnimeCardProps) {
	const secondaryTitle = anime.titleEnglish
		? anime.titleEnglish
		: anime.titleJapanese;
	const imageUrl = anime.images;

	const episodeText = anime.numberEpisodes
		? `${anime.numberEpisodes} episodes`
		: "¿? episodes";

	return (
		<Link href={`/anime/${anime.id}`} className="group block">
			<div className="h-full overflow-hidden rounded-lg bg-card shadow transition-shadow duration-200 hover:shadow-md">
				<div className="relative aspect-[3/4] overflow-hidden">
					<Image
						src={imageUrl}
						alt={`${anime.title} poster`}
						fill
						className="object-cover"
						priority={priority}
						sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
					/>
				</div>

				<div className="space-y-2 p-3">
					<h3
						className="line-clamp-2 font-medium text-sm leading-tight transition-colors group-hover:text-primary"
						title={anime.title}
					>
						{anime.title}
					</h3>
					{secondaryTitle && secondaryTitle !== anime.title && (
						<p className="text-muted-foreground text-xs" title={secondaryTitle}>
							{secondaryTitle}
						</p>
					)}

					<div className="flex items-center justify-between gap-2">
						<Badge variant="secondary" className="text-xs">
							{episodeText}
						</Badge>
						{anime.year && (
							<Badge variant="outline" className="ml-auto text-xs">
								{anime.year}
							</Badge>
						)}
					</div>
				</div>
			</div>
		</Link>
	);
}
