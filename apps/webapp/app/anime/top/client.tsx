"use client";

import { generateArray } from "@trackyrs/utils/src/react-list-key-generator";
import { useEffect, useMemo, useRef } from "react";
import { TopAnimeCard } from "@/app/anime/_components/anime-top-card";
import { useInfiniteTopAnime } from "@/app/api/anime/queries";
import { CardSkeleton } from "@/components/skeletons/card-skeleton";

export default function ClientTopAnime() {
	const observerRef = useRef<HTMLDivElement | null>(null);

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
	} = useInfiniteTopAnime();

	const allAnimes = useMemo(
		() => data?.pages.flatMap((p) => p.animes) ?? [],
		[data],
	);

	// Infinite scroll observer
	useEffect(() => {
		if (!observerRef.current) return;
		const el = observerRef.current;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{ threshold: 0.2 },
		);

		observer.observe(el);
		return () => {
			observer.unobserve(el);
		};
	}, [fetchNextPage, hasNextPage, isFetchingNextPage]);

	return (
		<div className="space-y-6">
			{isLoading ? (
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
					{generateArray("top-anime-card", 24).map((key) => (
						<CardSkeleton key={key} />
					))}
				</div>
			) : isError ? (
				<div className="text-center">
					<h3 className="mb-2 font-semibold text-lg text-red-500">
						Failed to load top anime
					</h3>
				</div>
			) : (
				<>
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
						{allAnimes.map((anime, index) => (
							<TopAnimeCard key={anime.id} anime={anime} rank={index + 1} />
						))}
					</div>
					{hasNextPage && (
						<div
							ref={observerRef}
							className="flex h-10 items-center justify-center"
						>
							{isFetchingNextPage && (
								<div className="flex items-center gap-2">
									<div className="h-4 w-4 animate-spin rounded-full border-primary border-b-2" />
								</div>
							)}
						</div>
					)}
				</>
			)}
		</div>
	);
}
