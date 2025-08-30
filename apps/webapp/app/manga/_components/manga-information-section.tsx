import type { Manga } from "@trackyrs/database/schemas/myanimelist/manga/manga-schema";
import type { GenreWithInfo as MangaGenreWithInfo } from "@trackyrs/database/types/manga-with-relations";
import { Badge } from "@trackyrs/ui/components/badge";
import { formatDateToLocaleDateStringOrUnknown } from "@trackyrs/utils/src/date-to-string";

interface MangaInformationSectionProps {
	manga: Manga;
	genres?: MangaGenreWithInfo[];
}

export function MangaInformationSection({
	manga,
	genres,
}: MangaInformationSectionProps) {
	const genreNames = Array.from(
		new Set(
			(genres ?? [])
				.map((g) => (g as any)?.genre?.name ?? (g as any)?.genres?.name)
				.filter((name): name is string => Boolean(name)),
		),
	);
	return (
		<section
			className="w-full rounded-lg border bg-card p-6"
			aria-labelledby="manga-information-heading"
		>
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{/* Type */}
				{manga.type && (
					<div className="space-y-1">
						<h3 className="font-semibold text-foreground text-sm tracking-wide">
							Type
						</h3>
						<p className="text-base text-foreground/70">{manga.type}</p>
					</div>
				)}

				{/* Status */}
				{manga.status && (
					<div className="space-y-1">
						<h3 className="font-semibold text-foreground text-sm tracking-wide">
							Status
						</h3>
						<p className="text-base text-foreground/70">{manga.status}</p>
					</div>
				)}

				{/* Publishing Range */}
				{(manga.publishingFrom || manga.publishingTo) && (
					<div className="space-y-1">
						<h3 className="font-semibold text-foreground text-sm tracking-wide">
							Published
						</h3>
						<p className="text-base text-foreground/70">
							{manga.publishingFrom
								? formatDateToLocaleDateStringOrUnknown(manga.publishingFrom)
								: "?"}{" "}
							-{" "}
							{manga.publishingTo
								? formatDateToLocaleDateStringOrUnknown(manga.publishingTo)
								: "?"}
						</p>
					</div>
				)}

				{/* Volumes */}
				<div className="space-y-1">
					<h3 className="font-semibold text-foreground text-sm tracking-wide">
						Volumes
					</h3>
					<p className="text-base text-foreground/70">
						{manga.numberVolumes || "Unknown"}
					</p>
				</div>

				{/* Chapters */}
				<div className="space-y-1">
					<h3 className="font-semibold text-foreground text-sm tracking-wide">
						Chapters
					</h3>
					<p className="text-base text-foreground/70">
						{manga.numberChapters || "Unknown"}
					</p>
				</div>

				{/* Genres */}
				{genreNames.length > 0 && (
					<div className="space-y-1 md:col-span-2 lg:col-span-3">
						<h3 className="font-semibold text-foreground text-sm tracking-wide">
							Genres
						</h3>
						<div className="flex flex-wrap gap-2">
							{genreNames.map((name) => (
								<Badge key={name} variant="secondary">
									{name}
								</Badge>
							))}
						</div>
					</div>
				)}
			</div>
		</section>
	);
}
