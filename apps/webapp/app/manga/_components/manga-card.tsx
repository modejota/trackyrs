"use client";

import type { Manga } from "@trackyrs/database/schemas/myanimelist/manga/manga-schema";
import { Badge } from "@trackyrs/ui/components/badge";
import Image from "next/image";
import Link from "next/link";

interface MangaCardProps {
	manga: Manga;
	priority?: boolean;
	showSecondaryTitle?: boolean;
}

export function MangaCard({
	manga,
	priority = false,
	showSecondaryTitle = true,
}: MangaCardProps) {
	const secondaryTitle = manga.titleEnglish
		? manga.titleEnglish
		: manga.titleJapanese;
	const imageUrl = manga.images;

	const chaptersText = manga.numberChapters
		? `${manga.numberChapters} chapters`
		: "¿? chapters";

	return (
		<Link href={`/manga/${manga.id}`} className="group block">
			<div className="flex h-full flex-col overflow-hidden rounded-lg bg-card shadow transition-shadow duration-200 hover:shadow-md">
				<div className="relative aspect-[3/4] overflow-hidden">
					<Image
						src={imageUrl}
						alt={`${manga.title} poster`}
						fill
						className="object-cover"
						priority={priority}
						sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
					/>
				</div>

				<div className="flex flex-1 flex-col space-y-2 p-3">
					<h3
						className="line-clamp-2 font-medium text-sm leading-tight transition-colors group-hover:text-primary"
						title={manga.title}
					>
						{manga.title}
					</h3>
					{showSecondaryTitle &&
						secondaryTitle &&
						secondaryTitle !== manga.title && (
							<p
								className="text-muted-foreground text-xs"
								title={secondaryTitle}
							>
								{secondaryTitle}
							</p>
						)}

					<div className="mt-auto flex items-center justify-between gap-2">
						<Badge variant="secondary" className="text-xs">
							{chaptersText}
						</Badge>
						{manga.publishingFrom && (
							<Badge variant="outline" className="ml-auto text-xs">
								{new Date(manga.publishingFrom).getFullYear()}
							</Badge>
						)}
					</div>
				</div>
			</div>
		</Link>
	);
}
