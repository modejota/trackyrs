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
import type { PeopleWithRelations } from "@/app/api/people/types";

type AnimeStaff = PeopleWithRelations["animeStaff"][number];
type MangaStaff = PeopleWithRelations["mangaStaff"][number];
type VoiceActing = PeopleWithRelations["voiceActing"][number];

function AnimeStaffCard({ item }: { item: AnimeStaff }) {
	const positions = Array.isArray(item.positions) ? item.positions : [];
	return (
		<Link
			href={`/anime/${item.anime.id}`}
			className="group block overflow-hidden rounded-lg border bg-card transition-colors hover:bg-accent"
		>
			<div className="relative aspect-[3/4] overflow-hidden">
				<Image
					src={item.anime.images}
					alt={item.anime.title || "Anime"}
					fill
					className="object-cover transition-transform duration-200 group-hover:scale-105"
					sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
				/>
				<div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100" />
			</div>
			<div className="space-y-2 p-3">
				<h4 className="line-clamp-2 font-medium text-sm leading-tight group-hover:text-primary">
					{item.anime.title || "Unknown Anime"}
				</h4>
				{positions.length > 0 && (
					<div className="flex flex-wrap gap-1">
						{positions.map((pos) => (
							<Badge key={pos} variant="outline" className="text-xs">
								{pos}
							</Badge>
						))}
					</div>
				)}
			</div>
		</Link>
	);
}

function MangaStaffCard({ item }: { item: MangaStaff }) {
	return (
		<Link
			href={`/manga/${item.manga.id}`}
			className="group block overflow-hidden rounded-lg border bg-card transition-colors hover:bg-accent"
		>
			<div className="relative aspect-[3/4] overflow-hidden">
				<Image
					src={item.manga.images}
					alt={item.manga.title || "Manga"}
					fill
					className="object-cover transition-transform duration-200 group-hover:scale-105"
					sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
				/>
				<div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100" />
			</div>
			<div className="space-y-2 p-3">
				<h4 className="line-clamp-2 font-medium text-sm leading-tight group-hover:text-primary">
					{item.manga.title || "Unknown Manga"}
				</h4>
			</div>
		</Link>
	);
}

export function PeopleContributionsSection({
	animeStaff = [],
	mangaStaff = [],
	voiceActing = [],
}: {
	animeStaff?: AnimeStaff[];
	mangaStaff?: MangaStaff[];
	voiceActing?: VoiceActing[];
}) {
	const total =
		(animeStaff?.length ?? 0) +
		(mangaStaff?.length ?? 0) +
		(voiceActing?.length ?? 0);

	if (!total) {
		return (
			<section aria-labelledby="people-contributions-heading">
				<div className="py-12 text-center">
					<div className="mx-auto max-w-md">
						<h3 className="mb-2 font-semibold text-lg">
							No Contributions Available
						</h3>
						<p className="text-muted-foreground text-sm">
							This person has no listed anime, manga, or voice acting
							contributions.
						</p>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section aria-labelledby="people-contributions-heading">
			<div className="space-y-6">
				<Tabs
					defaultValue={
						voiceActing.length
							? "characters"
							: animeStaff.length
								? "anime"
								: "manga"
					}
					className="w-full space-y-4"
				>
					<TabsList
						className="h-auto w-full rounded-none border-b bg-transparent p-0"
						role="tablist"
						aria-label="Contributions"
					>
						<TabsTrigger
							id="characters-contributions-tab"
							value="characters"
							className="relative flex min-h-[44px] items-center gap-2 rounded-none px-3 py-2 text-sm after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary sm:text-base"
							role="tab"
							aria-controls="characters-contributions-panel"
						>
							<span>Voice Acting</span>
							{voiceActing.length > 0 && (
								<span className="rounded-full bg-muted-foreground/20 px-2 py-0.5 text-xs">
									{voiceActing.length}
								</span>
							)}
						</TabsTrigger>
						<TabsTrigger
							id="anime-contributions-tab"
							value="anime"
							className="relative flex min-h-[44px] items-center gap-2 rounded-none px-3 py-2 text-sm after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary sm:text-base"
							role="tab"
							aria-controls="anime-contributions-panel"
						>
							<span>Animeography</span>
							{animeStaff.length > 0 && (
								<span className="rounded-full bg-muted-foreground/20 px-2 py-0.5 text-xs">
									{animeStaff.length}
								</span>
							)}
						</TabsTrigger>
						<TabsTrigger
							id="manga-contributions-tab"
							value="manga"
							className="relative flex min-h-[44px] items-center gap-2 rounded-none px-3 py-2 text-sm after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary sm:text-base"
							role="tab"
							aria-controls="manga-contributions-panel"
						>
							<span>Mangaography</span>
							{mangaStaff.length > 0 && (
								<span className="rounded-full bg-muted-foreground/20 px-2 py-0.5 text-xs">
									{mangaStaff.length}
								</span>
							)}
						</TabsTrigger>
					</TabsList>

					<TabsContent
						value="anime"
						className="rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						role="tabpanel"
						id="anime-contributions-panel"
						aria-labelledby="anime-contributions-tab"
					>
						{animeStaff.length === 0 ? (
							<div className="py-8 text-center text-muted-foreground text-sm">
								No anime staff contributions.
							</div>
						) : (
							<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
								{animeStaff.map((item) => (
									<AnimeStaffCard
										key={`anime-${item.anime.id}-${(item.positions || []).join("-")}`}
										item={item}
									/>
								))}
							</div>
						)}
					</TabsContent>

					<TabsContent
						value="manga"
						className="rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						role="tabpanel"
						id="manga-contributions-panel"
						aria-labelledby="manga-contributions-tab"
					>
						{mangaStaff.length === 0 ? (
							<div className="py-8 text-center text-muted-foreground text-sm">
								No manga staff contributions.
							</div>
						) : (
							<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
								{mangaStaff.map((item) => (
									<MangaStaffCard key={`manga-${item.manga.id}`} item={item} />
								))}
							</div>
						)}
					</TabsContent>

					<TabsContent
						value="characters"
						className="rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						role="tabpanel"
						id="characters-contributions-panel"
						aria-labelledby="characters-contributions-tab"
					>
						{voiceActing.length === 0 ? (
							<div className="py-8 text-center text-muted-foreground text-sm">
								No voice acting roles.
							</div>
						) : (
							<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
								{voiceActing.map((item) => (
									<Link
										key={`${item.character.id}-${item.language}`}
										href={`/characters/${item.character.id}`}
										className="overflow-hidden rounded-lg border bg-card"
									>
										<div className="relative aspect-[3/4] overflow-hidden">
											<Image
												src={item.character.images}
												alt={item.character.name || "Character"}
												fill
												className="object-cover"
												sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
											/>
										</div>
										<div className="space-y-1.5 p-2.5">
											<h4 className="line-clamp-2 font-medium text-sm leading-tight">
												{item.character.name || "Unknown Character"}
											</h4>
											<div className="flex items-center justify-between">
												<Badge variant="outline" className="text-[10px]">
													<span>{item.language}</span>
												</Badge>
											</div>
										</div>
									</Link>
								))}
							</div>
						)}
					</TabsContent>
				</Tabs>
			</div>
		</section>
	);
}
