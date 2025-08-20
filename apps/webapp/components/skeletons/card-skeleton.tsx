import { Skeleton } from "@trackyrs/ui/components/skeleton";

export function CardSkeleton() {
	return (
		<div className="h-full overflow-hidden rounded-lg bg-card shadow">
			<Skeleton className="aspect-[3/4] w-full" />
			<div className="space-y-2 p-3">
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-3 w-3/4" />
				<div className="flex items-center justify-between gap-2">
					<Skeleton className="h-5 w-20" />
					<Skeleton className="h-5 w-12" />
				</div>
			</div>
		</div>
	);
}
