"use client";

import type {
	CharacterWithRole,
	StaffWithRole,
} from "@trackyrs/database/types/manga-with-relations";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@trackyrs/ui/components/tabs";
import { CharactersGrid } from "@/components/grids/characters-grid";
import { StaffGrid } from "@/components/grids/staff-grid";

interface MangaTabsSectionProps {
	characters: CharacterWithRole[];
	staff: StaffWithRole[];
}

export function MangaTabsSection({ characters, staff }: MangaTabsSectionProps) {
	return (
		<section className="space-y-6">
			<h2 id="manga-content-heading" className="sr-only">
				Manga Content
			</h2>
			<Tabs defaultValue="characters" className="w-full space-y-4">
				<TabsList
					className="h-auto w-full rounded-none border-b bg-transparent p-0"
					role="tablist"
					aria-label="Manga content sections"
				>
					<TabsTrigger
						value="characters"
						className="relative flex min-h-[44px] items-center gap-2 rounded-none px-3 py-2 text-sm after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary sm:text-base"
						role="tab"
						aria-controls="characters-panel"
						aria-selected="true"
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
