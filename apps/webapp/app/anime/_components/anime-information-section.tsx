import type { Anime } from "@trackyrs/database/schemas/myanimelist/anime/anime-schema";
import type { GenreWithInfo as AnimeGenreWithInfo } from "@trackyrs/database/types/anime-with-relations";
import { Badge } from "@trackyrs/ui/components/badge";
import {
	convertBroadcastDayAndTimeToString,
	convertSecondsDurationToString,
	formatDateToLocaleDateStringOrUnknown,
	formatSeasonAndYearToString,
} from "@trackyrs/utils/src/date-to-string";

interface AnimeInformationSectionProps {
	anime: Anime;
	genres?: AnimeGenreWithInfo[];
}

export function AnimeInformationSection({
	anime,
	genres,
}: AnimeInformationSectionProps) {
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
			aria-labelledby="anime-information-heading"
		>
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{/* Type */}
				{anime.type && (
					<div className="space-y-1">
						<h3 className="font-semibold text-foreground text-sm tracking-wide">
							Type
						</h3>
						<p className="text-base text-foreground/70">{anime.type}</p>
					</div>
				)}

				{/* Status */}
				{anime.status && (
					<div className="space-y-1">
						<h3 className="font-semibold text-foreground text-sm tracking-wide">
							Status
						</h3>
						<p className="text-base text-foreground/70">{anime.status}</p>
					</div>
				)}

				{/* Episodes */}
				<div className="space-y-1">
					<h3 className="font-semibold text-foreground text-sm tracking-wide">
						Episodes
					</h3>
					<p className="text-base text-foreground/70">
						{anime.numberEpisodes || "Unknown"}
					</p>
				</div>

				{/* Duration */}
				<div className="space-y-1">
					<h3 className="font-semibold text-foreground text-sm tracking-wide">
						Duration
					</h3>
					<p className="text-base text-foreground/70">
						{convertSecondsDurationToString(anime.duration)}
					</p>
				</div>

				{/* Rating */}
				{anime.rating && (
					<div className="space-y-1">
						<h3 className="font-semibold text-foreground text-sm tracking-wide">
							Rating
						</h3>
						<p className="text-base text-foreground/70">{anime.rating}</p>
					</div>
				)}

				{/* Airing Range */}
				{(anime.airedFrom || anime.airedTo) && (
					<div className="space-y-1">
						<h3 className="font-semibold text-foreground text-sm tracking-wide">
							Aired
						</h3>
						<p className="text-base text-foreground/70">
							{anime.airedFrom
								? formatDateToLocaleDateStringOrUnknown(anime.airedFrom)
								: "?"}{" "}
							-{" "}
							{anime.airedTo
								? formatDateToLocaleDateStringOrUnknown(anime.airedTo)
								: "?"}
						</p>
					</div>
				)}

				{/* Season */}
				{anime.season && anime.year && (
					<div className="space-y-1">
						<h3 className="font-semibold text-foreground text-sm tracking-wide">
							Season
						</h3>
						<p className="text-base text-foreground/70">
							{formatSeasonAndYearToString(anime.season, anime.year)}
						</p>
					</div>
				)}

				{/* Broadcast Time */}
				{(anime.broadcastDay || anime.broadcastTime) && (
					<div className="space-y-1">
						<h3 className="font-semibold text-foreground text-sm tracking-wide">
							Broadcast
						</h3>
						<p className="text-base text-foreground/70">
							{convertBroadcastDayAndTimeToString(
								anime.broadcastDay,
								anime.broadcastTime,
							)}{" "}
							({anime.broadcastTimezone})
						</p>
					</div>
				)}

				{/* Source */}
				{anime.source && (
					<div className="space-y-1">
						<h3 className="font-semibold text-foreground text-sm tracking-wide">
							Source
						</h3>
						<p className="text-base text-foreground/70">{anime.source}</p>
					</div>
				)}

				{/* Year */}
				{anime.year && !anime.season && (
					<div className="space-y-1">
						<h3 className="font-semibold text-foreground text-sm tracking-wide">
							Year
						</h3>
						<p className="text-base text-foreground/70">{anime.year}</p>
					</div>
				)}

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
