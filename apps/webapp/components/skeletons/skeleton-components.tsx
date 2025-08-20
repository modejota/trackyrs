import { Card, CardContent, CardHeader } from "@trackyrs/ui/components/card";
import { Skeleton } from "@trackyrs/ui/components/skeleton";
import { generateArray } from "@trackyrs/utils/src/react-list-key-generator";
import { CardSkeleton } from "@/components/skeletons/card-skeleton";

export function AnimeOrMangaHeroSkeleton() {
	return (
		<div className="flex flex-col lg:flex-row">
			{/* Image Section */}
			<div className="relative h-96 w-full flex-shrink-0 lg:h-auto lg:w-80">
				<Skeleton className="h-full w-full" />
			</div>

			{/* Content Section */}
			<div className="flex-1 p-6 lg:p-8">
				<div className="space-y-4">
					{/* Title */}
					<div className="space-y-2">
						<Skeleton className="h-8 w-3/4" />
						<Skeleton className="h-6 w-1/2" />
						<Skeleton className="h-4 w-1/3" />
					</div>

					{/* Badges */}
					<div className="flex flex-wrap gap-2">
						{["badge-1", "badge-2", "badge-3", "badge-4", "badge-5"].map(
							(key) => (
								<Skeleton key={key} className="h-6 w-16" />
							),
						)}
					</div>

					{/* Synopsis */}
					<div className="space-y-2">
						<Skeleton className="h-6 w-24" />
						<div className="space-y-2">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-3/4" />
						</div>
					</div>

					{/* Additional Info */}
					<div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
						{generateArray("info", 4).map((key) => (
							<div key={key} className="space-y-1">
								<Skeleton className="h-4 w-16" />
								<Skeleton className="h-4 w-24" />
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

export function AnimeOrMangaInfoSkeleton() {
	return (
		<div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
			{["card-1", "card-2", "card-3", "card-4", "card-5", "card-6"].map(
				(cardKey) => (
					<Card key={cardKey}>
						<CardHeader>
							<Skeleton className="h-6 w-32" />
						</CardHeader>
						<CardContent className="space-y-3">
							{generateArray("row", 4).map((rowKey) => (
								<div
									key={`${cardKey}-${rowKey}`}
									className="flex items-center justify-between"
								>
									<Skeleton className="h-4 w-20" />
									<Skeleton className="h-4 w-16" />
								</div>
							))}
						</CardContent>
					</Card>
				),
			)}
		</div>
	);
}

export function AnimeOrMangaTabsSkeleton() {
	return (
		<section className="space-y-6">
			<div className="w-full">
				{/* Tabs List */}
				<div className="mb-6 grid w-full grid-cols-3 gap-2">
					{["tab-1", "tab-2", "tab-3"].map((key) => (
						<Skeleton key={key} className="h-10" />
					))}
				</div>

				{/* Tab Content */}
				<div className="rounded-lg border bg-card p-6">
					<div className="mb-4 flex items-center justify-between">
						<Skeleton className="h-6 w-32" />
						<Skeleton className="h-4 w-20" />
					</div>

					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
						{generateArray("item", 12).map((key) => (
							<CardSkeleton key={key} />
						))}
					</div>
				</div>
			</div>
		</section>
	);
}

export function AnimeOrMangaInformationSkeleton() {
	return (
		<section className="w-full rounded-lg border bg-card p-6">
			<Skeleton className="mb-4 h-6 w-32" />
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
				{generateArray("info-item", 8).map((key) => (
					<div key={key} className="space-y-1">
						<Skeleton className="h-3 w-16" />
						<Skeleton className="h-6 w-full" />
					</div>
				))}
			</div>
		</section>
	);
}
