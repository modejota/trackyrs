"use client";

import type { AnimeEpisode } from "@trackyrs/database/schemas/myanimelist/anime/anime-episode-schema";
import type {
	CharacterWithRole,
	StaffWithRole,
} from "@trackyrs/database/types/anime-with-relations";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@trackyrs/ui/components/tabs";
import { CharactersGrid } from "@/app/anime/_components/characters-grid";
import { EpisodesTable } from "@/app/anime/_components/episodes-table";
import { StaffGrid } from "@/app/anime/_components/staff-grid";

interface AnimeTabsSectionProps {
	episodes: AnimeEpisode[];
	characters: CharacterWithRole[];
	staff: StaffWithRole[];
}

export function AnimeTabsSection({
	episodes,
	characters,
	staff,
}: AnimeTabsSectionProps) {
	return (
		<section className="space-y-6">
			<h2 id="anime-content-heading" className="sr-only">
				Anime Content
			</h2>
			<Tabs defaultValue="episodes" className="w-full space-y-4">
				<TabsList
					className="h-auto w-full rounded-none border-b bg-transparent p-0"
					role="tablist"
					aria-label="Anime content sections"
				>
					<TabsTrigger
						value="episodes"
						className="relative flex min-h-[44px] items-center gap-2 rounded-none px-3 py-2 text-sm after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary sm:text-base"
						role="tab"
						aria-controls="episodes-panel"
						aria-selected="true"
					>
						<span>Episodes</span>
						{episodes.length > 0 && (
							<span className="rounded-full bg-muted-foreground/20 px-2 py-0.5 text-xs">
								{episodes.length}
							</span>
						)}
					</TabsTrigger>
					<TabsTrigger
						value="characters"
						className="relative flex min-h-[44px] items-center gap-2 rounded-none px-3 py-2 text-sm after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary sm:text-base"
						role="tab"
						aria-controls="characters-panel"
					>
						<span>Characters</span>
						{characters.length > 0 && (
							<span className="rounded-full bg-muted-foreground/20 px-2 py-0.5 text-xs">
								{characters.length}
							</span>
						)}
					</TabsTrigger>
					<TabsTrigger
						value="staff"
						className="relative flex min-h-[44px] items-center gap-2 rounded-none px-3 py-2 text-sm after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary sm:text-base"
						role="tab"
						aria-controls="staff-panel"
					>
						<span>Staff</span>
						{staff.length > 0 && (
							<span className="rounded-full bg-muted-foreground/20 px-2 py-0.5 text-xs">
								{staff.length}
							</span>
						)}
					</TabsTrigger>
				</TabsList>

				<TabsContent
					value="episodes"
					className="rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					role="tabpanel"
					id="episodes-panel"
					aria-labelledby="episodes-tab"
				>
					<div className="rounded-lg border bg-card p-4 sm:p-6">
						<EpisodesTable episodes={episodes} />
					</div>
				</TabsContent>

				<TabsContent
					value="characters"
					className="rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					role="tabpanel"
					id="characters-panel"
					aria-labelledby="characters-tab"
				>
					<div className="rounded-lg border bg-card p-4 sm:p-6">
						<CharactersGrid characters={characters} />
					</div>
				</TabsContent>

				<TabsContent
					value="staff"
					className="rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					role="tabpanel"
					id="staff-panel"
					aria-labelledby="staff-tab"
				>
					<div className="rounded-lg border bg-card p-4 sm:p-6">
						<StaffGrid staff={staff} />
					</div>
				</TabsContent>
			</Tabs>
		</section>
	);
}
