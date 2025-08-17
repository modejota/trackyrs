import type { Manga } from "@trackyrs/database/schemas/myanimelist/manga/manga-schema";
import { formatDateToLocaleDateStringOrUnknown } from "@trackyrs/utils/src/date-to-string";

interface MangaInformationSectionProps {
	manga: Manga;
}

export function MangaInformationSection({
	manga,
}: MangaInformationSectionProps) {
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
			</div>
		</section>
	);
}
