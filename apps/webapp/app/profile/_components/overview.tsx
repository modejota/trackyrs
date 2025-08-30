"use client";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@trackyrs/ui/components/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@trackyrs/ui/components/select";
import { Skeleton } from "@trackyrs/ui/components/skeleton";
import { generateArray } from "@trackyrs/utils/react-list-key-generator";
import { convertSecondsDurationToString } from "@trackyrs/utils/src/date-to-string";
import { capitalizeSentenceWordByWord } from "@trackyrs/utils/src/string";
import { Star } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
	useAnimeOverviewStats,
	useMangaOverviewStats,
} from "@/app/api/profile/queries";
import { EpisodesWatchedBarsCard } from "./charts/episodes-watched-bars-card";
import { HistogramCard } from "./charts/histogram-card";
import { PieChartCard } from "./charts/pie-chart-card";
import { YearSeasonBarsCard } from "./charts/year-season-bars-card";

function LoadingGrid() {
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
			{generateArray("loading-grid-skeleton", 6).map((key) => (
				<Card key={key}>
					<CardHeader>
						<Skeleton className="h-6 w-40" />
					</CardHeader>
					<CardContent>
						<Skeleton className="h-48 w-full" />
					</CardContent>
				</Card>
			))}
		</div>
	);
}

const PALETTE = [
	"#0ea5e9",
	"#a78bfa",
	"#f59e0b",
	"#10b981",
	"#ef4444",
	"#22d3ee",
	"#84cc16",
	"#e879f9",
	"#38bdf8",
	"#f97316",
	"#6366f1",
	"#14b8a6",
];
const STATUS_COLORS: Record<string, string> = {
	COMPLETED: "#16a34a",
	DROPPED: "#ef4444",
	WATCHING: "#0ea5e9",
	READING: "#0ea5e9",
	PAUSED: "#f59e0b",
	PLAN_TO_WATCH: "#6366f1",
	PLAN_TO_READ: "#6366f1",
	REWATCHING: "#a78bfa",
	REREADING: "#a78bfa",
};

function TopFive({
	title,
	items,
	basePath,
	emptyCtaPath,
}: {
	title: string;
	items: { id: number; title: string; images: string; score: number }[];
	basePath: "anime" | "manga";
	emptyCtaPath: string;
}) {
	return (
		<div className="space-y-2">
			<h4 className="font-semibold text-muted-foreground text-sm">{title}</h4>
			{!items || items.length === 0 ? (
				<div className="rounded-md border p-4 text-muted-foreground text-sm">
					Seems like you haven&apos;t rated any {basePath}. Let&apos;s go and
					search for some.
					<a href={emptyCtaPath} className="ml-2 underline">
						Browse {basePath}
					</a>
				</div>
			) : (
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
					{items.slice(0, 5).map((it) => (
						<a
							key={`${basePath}-${it.id}`}
							href={`/${basePath}/${it.id}`}
							className="block overflow-hidden rounded-md border bg-card"
						>
							<div className="relative aspect-[3/4]">
								<img
									src={it.images}
									alt={it.title}
									className="h-full w-full object-cover"
								/>
							</div>
							<div className="p-2">
								<div className="flex items-start gap-2">
									<div
										className="line-clamp-2 font-medium text-sm leading-snug"
										title={it.title ?? undefined}
									>
										{it.title}
									</div>
									<div className="ml-auto inline-flex items-center gap-1.5 text-muted-foreground text-sm">
										<Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
										<span className="font-semibold text-foreground">
											{it.score}
										</span>
									</div>
								</div>
							</div>
						</a>
					))}
				</div>
			)}
		</div>
	);
}

function ChartSelector({
	value,
	onChange,
	options,
}: {
	value: string;
	onChange: (v: string) => void;
	options: { value: string; label: string }[];
}) {
	return (
		<Select value={value} onValueChange={onChange}>
			<SelectTrigger size="sm">
				<SelectValue placeholder="Select chart" />
			</SelectTrigger>
			<SelectContent>
				{options.map((opt) => (
					<SelectItem key={opt.value} value={opt.value}>
						{opt.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

export function OverviewTab() {
	const params = useParams<{ username: string }>();
	const username = (params?.username as string) ?? "";
	const { data: animeStats, isLoading: loadingAnime } =
		useAnimeOverviewStats(username);
	const { data: mangaStats, isLoading: loadingManga } =
		useMangaOverviewStats(username);

	const loading = loadingAnime || loadingManga;

	const [animeChart, setAnimeChart] = useState<string>("genres");
	const [mangaChart, setMangaChart] = useState<string>("genres");

	const hasAnime = (animeStats?.total ?? 0) > 0;
	const hasManga = (mangaStats?.total ?? 0) > 0;

	if (loading) {
		return (
			<div className="space-y-4">
				<div className="space-y-1">
					<Skeleton className="h-5 w-80" />
					<Skeleton className="h-5 w-80" />
				</div>
				<LoadingGrid />
			</div>
		);
	}

	return (
		<div className="space-y-4 py-6">
			<section className="space-y-3">
				<h3 className="font-semibold text-lg md:text-xl">Anime</h3>
				<p className="flex flex-wrap items-center gap-x-1 text-sm">
					<span>You&apos;ve tracked</span>
					<span className="font-semibold">{animeStats?.total ?? 0}</span>
					<span>anime with an average score of</span>
					<span className="font-semibold">
						{animeStats?.averageScore ?? "—"}
					</span>
					{typeof animeStats?.totalEpisodesWatched === "number" &&
					typeof animeStats?.totalSecondsWatched === "number" ? (
						<>
							<span>and watched</span>
							<span className="font-semibold">
								{animeStats.totalEpisodesWatched}
							</span>
							<span>episodes</span>
							{animeStats.totalSecondsWatched > 0 ? (
								<span>
									(
									{animeStats.totalSecondsWatched >= 86400
										? `${(animeStats.totalSecondsWatched / 86400).toFixed(1)} days`
										: convertSecondsDurationToString(
												animeStats.totalSecondsWatched,
											)}
									)
								</span>
							) : null}
						</>
					) : null}
				</p>
				<TopFive
					title="Your top 5 anime"
					items={animeStats?.top5ByScore ?? []}
					basePath="anime"
					emptyCtaPath="/anime/search"
				/>
				<div className="flex items-center justify-between">
					<h4 className="font-semibold text-muted-foreground text-sm">
						Charts
					</h4>
					{hasAnime && (
						<ChartSelector
							value={animeChart}
							onChange={setAnimeChart}
							options={[
								{ value: "status", label: "Status" },
								{ value: "genres", label: "Genres" },
								{ value: "season", label: "By year & season" },
								{ value: "scores", label: "Score distribution" },
								{ value: "episodes", label: "Episodes watched per anime" },
							]}
						/>
					)}
				</div>
				{hasAnime ? (
					<div className="grid grid-cols-1 gap-4">
						{animeChart === "status" && (
							<PieChartCard
								title="Status"
								data={animeStats?.statusPie ?? []}
								kind="status-anime"
							/>
						)}
						{animeChart === "genres" && (
							<PieChartCard
								title="Genres"
								data={animeStats?.genresPie ?? []}
								kind="genre"
								footerText={
									animeStats?.mostWatchedGenre
										? `Your most watched genre is ${capitalizeSentenceWordByWord(animeStats.mostWatchedGenre)}`
										: undefined
								}
							/>
						)}
						{animeChart === "season" && (
							<YearSeasonBarsCard
								title="By year & season"
								data={animeStats?.yearSeasonBars ?? []}
								footerText={
									animeStats?.topSeasonYear
										? `Season ${animeStats.topSeasonYear.season} from Year ${animeStats.topSeasonYear.year} was the one you watched more anime from`
										: undefined
								}
							/>
						)}
						{animeChart === "scores" && (
							<HistogramCard
								title="Score distribution"
								data={animeStats?.scoreHistogram ?? []}
								detailed={animeStats?.scoreHistogramDetailed}
							/>
						)}
						{animeChart === "episodes" && (
							<EpisodesWatchedBarsCard
								title="Episodes watched per anime"
								data={animeStats?.episodesWatchedHistogram ?? []}
							/>
						)}
					</div>
				) : (
					<div className="rounded-md border p-4 text-muted-foreground text-sm">
						Once you start tracking anime, here you can visualize some cool
						graphs
					</div>
				)}
			</section>

			<section className="space-y-3">
				<h3 className="font-semibold text-lg md:text-xl">Manga</h3>
				<p className="flex flex-wrap items-center gap-x-1 text-sm">
					<span>You&apos;ve tracked</span>
					<span className="font-semibold">{mangaStats?.total ?? 0}</span>
					<span>manga with an average score of</span>
					{mangaStats?.averageScore != null ? (
						<span className="inline-flex items-center gap-1 font-semibold leading-none">
							<span className="leading-none">{mangaStats.averageScore}</span>
						</span>
					) : (
						<span className="font-semibold">—</span>
					)}
				</p>
				<TopFive
					title="Your top 5 manga"
					items={mangaStats?.top5ByScore ?? []}
					basePath="manga"
					emptyCtaPath="/manga/search"
				/>
				<div className="flex items-center justify-between">
					<h4 className="font-semibold text-muted-foreground text-sm">
						Charts
					</h4>
					{hasManga && (
						<ChartSelector
							value={mangaChart}
							onChange={setMangaChart}
							options={[
								{ value: "status", label: "Status" },
								{ value: "genres", label: "Genres" },
								{ value: "scores", label: "Score distribution" },
							]}
						/>
					)}
				</div>
				{hasManga ? (
					<div className="grid grid-cols-1 gap-4">
						{mangaChart === "status" && (
							<PieChartCard
								title="Status"
								data={mangaStats?.statusPie ?? []}
								kind="status-manga"
							/>
						)}
						{mangaChart === "genres" && (
							<PieChartCard
								title="Genres"
								data={mangaStats?.genresPie ?? []}
								kind="genre"
								footerText={
									mangaStats?.mostReadGenre
										? `Your most read genre is ${capitalizeSentenceWordByWord(mangaStats.mostReadGenre)}`
										: undefined
								}
							/>
						)}
						{mangaChart === "scores" && (
							<HistogramCard
								title="Score distribution"
								data={mangaStats?.scoreHistogram ?? []}
							/>
						)}
					</div>
				) : (
					<div className="rounded-md border p-4 text-muted-foreground text-sm">
						Once you start tracking manga, here you can visualize some cool
						graphs
					</div>
				)}
			</section>
		</div>
	);
}
