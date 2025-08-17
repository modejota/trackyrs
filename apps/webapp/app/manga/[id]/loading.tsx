import {
	AnimeOrMangaHeroSkeleton,
	AnimeOrMangaInformationSkeleton,
	AnimeOrMangaInfoSkeleton,
	AnimeOrMangaTabsSkeleton,
} from "@/components/skeletons/skeleton-components";

export default function MangaDetailLoading() {
	return (
		<main className="container mx-auto px-4 py-8">
			<div className="space-y-8">
				<AnimeOrMangaHeroSkeleton />
				<AnimeOrMangaInformationSkeleton />
				<AnimeOrMangaInfoSkeleton />
				<AnimeOrMangaTabsSkeleton />
			</div>
		</main>
	);
}
