import {
	AnimeOrMangaTabsSkeleton,
	PeopleOrCharacterHeroSkeleton,
} from "@/components/skeletons/skeleton-components";

export default function Loading() {
	return (
		<main className="container mx-auto px-4 py-8">
			<div className="space-y-8">
				<PeopleOrCharacterHeroSkeleton />
				<AnimeOrMangaTabsSkeleton />
			</div>
		</main>
	);
}
