"use client";

import { Skeleton } from "@trackyrs/ui/components/skeleton";
import { generateArray } from "@trackyrs/utils/react-list-key-generator";

export function ProfileLoadingSkeleton() {
	return (
		<main className="container mx-auto space-y-6 px-4 py-8">
			{/* Header */}
			<section>
				<Skeleton className="h-9 w-52" />
			</section>

			{/* Tabs and content skeleton */}
			<section className="space-y-8">
				{/* Tabs list */}
				<div className="flex w-full gap-2 border-b pb-2">
					<Skeleton className="h-9 w-24" />
					<Skeleton className="h-9 w-36" />
					<Skeleton className="h-9 w-36" />
				</div>

				{/* Overview tab default content - Anime section */}
				<div className="space-y-4">
					<Skeleton className="h-6 w-28" />
					<div className="flex flex-wrap items-center gap-2">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-4 w-10" />
						<Skeleton className="h-4 w-40" />
						<Skeleton className="h-4 w-10" />
						<Skeleton className="h-4 w-36" />
					</div>

					{/* Top 5 heading */}
					<Skeleton className="h-5 w-44" />

					{/* Top 5 grid */}
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
						{generateArray("profile-anime-top5-skel", 5).map((key) => (
							<div
								key={key}
								className="overflow-hidden rounded-md border bg-card"
							>
								<div className="relative aspect-[3/4]">
									<Skeleton className="absolute inset-0 h-full w-full" />
								</div>
								<div className="space-y-2 p-2">
									<Skeleton className="h-4 w-[85%]" />
									<div className="flex items-center gap-2">
										<Skeleton className="h-4 w-24" />
										<div className="ml-auto inline-flex items-center gap-1.5">
											<Skeleton className="h-4 w-10" />
										</div>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Charts header with selector */}
					<div className="flex items-center justify-between">
						<Skeleton className="h-5 w-24" />
						<Skeleton className="h-9 w-48" />
					</div>

					{/* Chart card */}
					<div className="grid grid-cols-1 gap-4">
						<div className="rounded-md border">
							<div className="p-4">
								<Skeleton className="h-6 w-40" />
							</div>
							<div className="p-4">
								<Skeleton className="h-56 w-full" />
							</div>
						</div>
					</div>
				</div>

				{/* Overview tab default content - Manga section */}
				<div className="space-y-4">
					<Skeleton className="h-6 w-28" />
					<div className="flex flex-wrap items-center gap-2">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-4 w-10" />
						<Skeleton className="h-4 w-40" />
						<Skeleton className="h-4 w-10" />
					</div>

					{/* Top 5 heading */}
					<Skeleton className="h-5 w-44" />

					{/* Top 5 grid */}
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
						{generateArray("profile-manga-top5-skel", 5).map((key) => (
							<div
								key={key}
								className="overflow-hidden rounded-md border bg-card"
							>
								<div className="relative aspect-[3/4]">
									<Skeleton className="absolute inset-0 h-full w-full" />
								</div>
								<div className="space-y-2 p-2">
									<Skeleton className="h-4 w-[85%]" />
									<div className="flex items-center gap-2">
										<Skeleton className="h-4 w-24" />
										<div className="ml-auto inline-flex items-center gap-1.5">
											<Skeleton className="h-4 w-10" />
										</div>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Charts header with selector */}
					<div className="flex items-center justify-between">
						<Skeleton className="h-5 w-24" />
						<Skeleton className="h-9 w-48" />
					</div>

					{/* Chart card */}
					<div className="grid grid-cols-1 gap-4">
						<div className="rounded-md border">
							<div className="p-4">
								<Skeleton className="h-6 w-40" />
							</div>
							<div className="p-4">
								<Skeleton className="h-56 w-full" />
							</div>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
