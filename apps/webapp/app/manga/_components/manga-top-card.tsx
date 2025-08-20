import type { Manga } from "@trackyrs/database/schemas/myanimelist/manga/manga-schema";
import { Badge } from "@trackyrs/ui/components/badge";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function TopMangaCard({
	manga,
	rank,
	showSecondaryTitle = true,
}: {
	manga: Manga;
	rank: number;
	showSecondaryTitle?: boolean;
}) {
	const secondaryTitle = manga.titleEnglish
		? manga.titleEnglish
		: manga.titleJapanese;
	const imageUrl = manga.images;
	const score = manga.referenceScore ?? 0;

	return (
		<Link href={`/manga/${manga.id}`} className="group block">
			<div className="relative flex h-full flex-col overflow-hidden rounded-lg bg-card shadow transition-shadow duration-200 hover:shadow-md">
				{/* Badges */}
				<div className="pointer-events-none absolute top-0 left-0 z-10 m-2 rounded bg-white/95 px-3 py-1.5 font-semibold text-gray-900 text-sm shadow-lg">
					#{rank}
				</div>
				<div className="pointer-events-none absolute top-0 right-0 z-10 m-2 flex items-center gap-1 rounded bg-white/95 px-3 py-1.5 text-sm shadow-lg">
					<Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
					<span className="font-medium text-gray-900">{score.toFixed(2)}</span>
				</div>

				<div className="relative aspect-[3/4] overflow-hidden">
					<Image
						src={imageUrl}
						alt={`${manga.title} poster`}
						fill
						className="object-cover"
						priority={rank <= 12}
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
							{manga.numberChapters
								? `${manga.numberChapters} chapters`
								: "¿? chapters"}
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
