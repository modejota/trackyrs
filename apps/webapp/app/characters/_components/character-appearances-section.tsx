"use client";

import { Badge } from "@trackyrs/ui/components/badge";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@trackyrs/ui/components/tabs";
import Image from "next/image";
import Link from "next/link";
import type {
	AnimeAppearance,
	MangaAppearance,
} from "@/app/api/characters/types";

interface CharacterAppearancesSectionProps {
	animeAppearances: AnimeAppearance[];
	mangaAppearances: MangaAppearance[];
}

function AnimeAppearanceCard({ appearance }: { appearance: AnimeAppearance }) {
	return (
		<Link
			href={`/anime/${appearance.anime.id}`}
			className="group block overflow-hidden rounded-lg border bg-card transition-colors hover:bg-accent"
		>
			<div className="relative aspect-[3/4] overflow-hidden">
				<Image
					src={appearance.anime.images}
					alt={appearance.anime.title || "Anime"}
					fill
					className="object-cover transition-transform duration-200 group-hover:scale-105"
					sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
				/>
				<div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100" />
			</div>
			<div className="space-y-2 p-3">
				<h4 className="line-clamp-2 font-medium text-sm leading-tight group-hover:text-primary">
					{appearance.anime.title || "Unknown Anime"}
				</h4>
				<div className="flex items-center">
					<Badge variant="outline" className="text-xs">
						{appearance.role}
					</Badge>
				</div>
			</div>
		</Link>
	);
}

function MangaAppearanceCard({ appearance }: { appearance: MangaAppearance }) {
	return (
		<Link
			href={`/manga/${appearance.manga.id}`}
			className="group block overflow-hidden rounded-lg border bg-card transition-colors hover:bg-accent"
		>
			<div className="relative aspect-[3/4] overflow-hidden">
				<Image
					src={appearance.manga.images}
					alt={appearance.manga.title || "Manga"}
					fill
					className="object-cover transition-transform duration-200 group-hover:scale-105"
					sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
				/>
				<div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100" />
			</div>
			<div className="space-y-2 p-3">
				<h4 className="line-clamp-2 font-medium text-sm leading-tight group-hover:text-primary">
					{appearance.manga.title || "Unknown Manga"}
				</h4>
				<div className="flex items-center">
					<Badge variant="outline" className="text-xs">
						{appearance.role}
					</Badge>
				</div>
			</div>
		</Link>
	);
}

export function CharacterAppearancesSection({
	animeAppearances,
	mangaAppearances,
}: CharacterAppearancesSectionProps) {
	const totalAppearances = animeAppearances.length + mangaAppearances.length;

	if (totalAppearances === 0) {
		return (
			<section aria-labelledby="character-appearances-heading">
				<div className="space-y-6">
					<div className="py-12 text-center">
						<div className="mx-auto max-w-md">
							<h3 className="mb-2 font-semibold text-lg">
								No Appearances Available
							</h3>
							<p className="text-muted-foreground text-sm">
								This character hasn't appeared in any anime or manga yet.
							</p>
						</div>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section aria-labelledby="character-appearances-heading">
			<div className="space-y-6">
				<Tabs
					defaultValue={animeAppearances.length ? "anime" : "manga"}
					className="w-full space-y-4"
				>
					<TabsList
						className="h-auto w-full rounded-none border-b bg-transparent p-0"
						role="tablist"
						aria-label="Appearances"
					>
						<TabsTrigger
							value="anime"
							className="relative flex min-h-[44px] items-center gap-2 rounded-none px-3 py-2 text-sm after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary sm:text-base"
							role="tab"
							aria-controls="anime-appearances-panel"
						>
							<span>Animeography</span>
							{animeAppearances.length > 0 && (
								<span className="rounded-full bg-muted-foreground/20 px-2 py-0.5 text-xs">
									{animeAppearances.length}
								</span>
							)}
						</TabsTrigger>
						<TabsTrigger
							value="manga"
							className="relative flex min-h-[44px] items-center gap-2 rounded-none px-3 py-2 text-sm after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary sm:text-base"
							role="tab"
							aria-controls="manga-appearances-panel"
						>
							<span>Mangaography</span>
							{mangaAppearances.length > 0 && (
								<span className="rounded-full bg-muted-foreground/20 px-2 py-0.5 text-xs">
									{mangaAppearances.length}
								</span>
							)}
						</TabsTrigger>
					</TabsList>

					<TabsContent
						value="anime"
						className="rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						role="tabpanel"
						id="anime-appearances-panel"
						aria-labelledby="anime-appearances-tab"
					>
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
							{animeAppearances.map((appearance) => (
								<AnimeAppearanceCard
									key={`anime-${appearance.anime.id}`}
									appearance={appearance}
								/>
							))}
						</div>
					</TabsContent>

					<TabsContent
						value="manga"
						className="rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						role="tabpanel"
						id="manga-appearances-panel"
						aria-labelledby="manga-appearances-tab"
					>
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
							{mangaAppearances.map((appearance) => (
								<MangaAppearanceCard
									key={`manga-${appearance.manga.id}`}
									appearance={appearance}
								/>
							))}
						</div>
					</TabsContent>
				</Tabs>

				{animeAppearances.length > 0 && mangaAppearances.length === 0 && (
					<div className="py-4 text-center" aria-live="polite">
						<p className="text-muted-foreground text-sm">
							Only anime appearances are available for this character.
						</p>
					</div>
				)}

				{mangaAppearances.length > 0 && animeAppearances.length === 0 && (
					<div className="py-4 text-center" aria-live="polite">
						<p className="text-muted-foreground text-sm">
							Only manga appearances are available for this character.
						</p>
					</div>
				)}
			</div>
		</section>
	);
}
