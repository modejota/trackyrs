"use client";

import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@trackyrs/ui/components/tabs";
import { useEffect } from "react";
import {
	useProfileAnimeLists,
	useProfileMangaLists,
	useUserByUsername,
} from "@/app/api/profile/queries";
import { AnimeTab } from "@/app/profile/_components/anime-tab";
import { MangaTab } from "@/app/profile/_components/manga-tab";
import { OverviewTab } from "@/app/profile/_components/overview";
import { ProfileLoadingSkeleton } from "../_components/profile-loading-skeleton";

export default function ClientProfile({ username }: { username: string }) {
	const { data, isLoading, isError } = useUserByUsername(username);
	useEffect(() => {
		// Set the tab title using the username immediately; refine if display name differs
		document.title = `Trackyrs | ${username}`;
		return () => {
			document.title = "Trackyrs";
		};
	}, [username]);

	const { data: animeLists, isLoading: isAnimeLoading } =
		useProfileAnimeLists(username);
	const { data: mangaLists, isLoading: isMangaLoading } =
		useProfileMangaLists(username);

	if (isLoading) {
		return <ProfileLoadingSkeleton />;
	}

	if (isError || !data) {
		return (
			<main className="container mx-auto px-4 py-16">
				<p className="text-center text-muted-foreground">User not found.</p>
			</main>
		);
	}

	const name = data.username ?? "User";

	return (
		<main className="container mx-auto px-4 py-8">
			<section className="mb-6">
				<h1 className="font-bold text-3xl">{name}</h1>
			</section>

			<section className="space-y-6">
				<h2 id="profile-content-heading" className="sr-only">
					Profile Content
				</h2>
				<Tabs defaultValue="overview" className="w-full space-y-4">
					<TabsList
						className="h-auto w-full rounded-none border-b bg-transparent p-0"
						role="tablist"
						aria-label="Profile sections"
					>
						<TabsTrigger
							value="overview"
							className="relative flex min-h-[44px] items-center gap-2 rounded-none px-3 py-2 text-sm after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary sm:text-base"
							role="tab"
							aria-controls="overview-panel"
							aria-selected="true"
						>
							<span>Overview</span>
						</TabsTrigger>
						<TabsTrigger
							value="anime"
							className="relative flex min-h-[44px] items-center gap-2 rounded-none px-3 py-2 text-sm after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary sm:text-base"
							role="tab"
							aria-controls="anime-panel"
						>
							<span>Anime tracked</span>
						</TabsTrigger>
						<TabsTrigger
							value="manga"
							className="relative flex min-h-[44px] items-center gap-2 rounded-none px-3 py-2 text-sm after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary sm:text-base"
							role="tab"
							aria-controls="manga-panel"
						>
							<span>Manga tracked</span>
						</TabsTrigger>
					</TabsList>

					<TabsContent
						value="overview"
						className="rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						role="tabpanel"
						id="overview-panel"
						aria-labelledby="overview-tab"
					>
						<OverviewTab />
					</TabsContent>

					<TabsContent
						value="anime"
						className="rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						role="tabpanel"
						id="anime-panel"
						aria-labelledby="anime-tab"
					>
						<AnimeTab animeLists={animeLists} isLoading={isAnimeLoading} />
					</TabsContent>

					<TabsContent
						value="manga"
						className="rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						role="tabpanel"
						id="manga-panel"
						aria-labelledby="manga-tab"
					>
						<MangaTab mangaLists={mangaLists} isLoading={isMangaLoading} />
					</TabsContent>
				</Tabs>
			</section>
		</main>
	);
}
