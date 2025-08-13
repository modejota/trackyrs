import type { Anime } from "@trackyrs/database/schemas/myanimelist/anime/anime-schema";

interface AnimeInformationSectionProps {
	anime: Anime;
}

export function AnimeInformationSection({
	anime,
}: AnimeInformationSectionProps) {
	const formatDuration = (seconds: number | null) => {
		if (!seconds) return "Unknown";
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes} minutes`;
		const hours = Math.floor(minutes / 60);
		const remainingMinutes = minutes % 60;
		return remainingMinutes > 0
			? `${hours} hours ${remainingMinutes} minutes`
			: `${hours} hours`;
	};

	const formatDate = (dateString: string | null) => {
		if (!dateString) return "Unknown";
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const formatSeason = (season: string | null, year: number | null) => {
		if (!season || !year) return "Unknown";
		const seasonName = season.charAt(0).toUpperCase() + season.slice(1);
		return `${seasonName} ${year}`;
	};

	const formatBroadcast = (day: string | null, time: string | null) => {
		if (!day && !time) return "Unknown";
		if (day && time) return `${day} at ${time}`;
		return day || time || "Unknown";
	};

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
						{formatDuration(anime.duration)}
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
							{anime.airedFrom ? formatDate(anime.airedFrom) : "?"} -{" "}
							{anime.airedTo ? formatDate(anime.airedTo) : "?"}
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
							{formatSeason(anime.season, anime.year)}
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
							{formatBroadcast(anime.broadcastDay, anime.broadcastTime)} (
							{anime.broadcastTimezone})
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
			</div>
		</section>
	);
}
