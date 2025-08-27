import type { Manga } from "@trackyrs/database/schemas/myanimelist/manga/manga-schema";
import { Badge } from "@trackyrs/ui/components/badge";
import { capitalizeSentenceWordByWord } from "@trackyrs/utils/src/string";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { UserTracksMangaStatus } from "@/app/api/manga-tracks/types";
import { authClient } from "@/lib/auth-client";

type MangaWithUserTrack = Manga & {
	userTrackStatus?: string | null;
	userTrackScore?: number | null;
	userTrackChaptersRead?: number | null;
};

export function TopMangaCard({
	manga,
	rank,
	showSecondaryTitle = true,
}: {
	manga: MangaWithUserTrack;
	rank: number;
	showSecondaryTitle?: boolean;
}) {
	const { data: session } = authClient.useSession();
	const secondaryTitle = manga.titleEnglish
		? manga.titleEnglish
		: manga.titleJapanese;
	const imageUrl = manga.images;
	const score = manga.referenceScore ?? 0;

	const hasUserTrack = Boolean(
		(manga.userTrackStatus && manga.userTrackStatus.length > 0) ||
			manga.userTrackScore != null ||
			manga.userTrackChaptersRead != null,
	);

	return (
		<Link href={`/manga/${manga.id}`} className="group block">
			<div className="relative flex h-full flex-col overflow-hidden rounded-lg bg-card shadow transition-shadow duration-200 hover:shadow-md dark:border dark:border-white/10">
				{/* Badges */}
				<div className="pointer-events-none absolute top-0 left-0 z-[5] m-2 rounded bg-card px-3 py-1.5 font-semibold text-foreground text-sm shadow-lg">
					#{rank}
				</div>
				<div className="pointer-events-none absolute top-0 right-0 z-[5] m-2 flex items-center gap-1 rounded bg-card px-3 py-1.5 text-sm shadow-lg">
					<Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
					<span className="font-medium text-foreground">
						{score.toFixed(2)}
					</span>
				</div>

				<div className="relative aspect-[3/4] overflow-hidden">
					<Image
						src={imageUrl}
						alt={`${manga.title} poster`}
						fill
						className="object-cover"
						priority={rank <= 12}
						sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
					/>
				</div>

				<div className="flex flex-1 flex-col space-y-2 p-3">
					<h3
						className="line-clamp-2 font-medium text-sm leading-tight transition-colors group-hover:text-primary"
						title={manga.title}
					>
						{manga.title}
					</h3>
					{showSecondaryTitle &&
						secondaryTitle &&
						secondaryTitle !== manga.title && (
							<p
								className="text-muted-foreground text-xs"
								title={secondaryTitle}
							>
								{secondaryTitle}
							</p>
						)}

					<div className="mt-auto flex items-center justify-between gap-2">
						<Badge variant="secondary" className="text-xs">
							{manga.numberChapters
								? `${manga.numberChapters} chapters`
								: "¿? chapters"}
						</Badge>
						{manga.publishingFrom && (
							<Badge variant="outline" className="ml-auto text-xs">
								{new Date(manga.publishingFrom).getFullYear()}
							</Badge>
						)}
					</div>

					{session?.user && hasUserTrack && (
						<div className="pt-1">
							<Badge
								variant="outline"
								className="w-full text-[10px] sm:text-xs"
							>
								<div className="flex w-full items-center justify-evenly">
									<span className="min-w-0 truncate">
										{capitalizeSentenceWordByWord(
											manga.userTrackStatus ?? null,
										)}
									</span>

									{manga.userTrackStatus &&
										manga.userTrackStatus !== UserTracksMangaStatus.COMPLETED &&
										manga.userTrackStatus !==
											UserTracksMangaStatus.REREADING && (
											<span className="whitespace-nowrap">
												Ch: {manga.userTrackChaptersRead ?? 0}
											</span>
										)}

									{typeof manga.userTrackScore === "number" && (
										<span className="inline-flex items-center">
											<Star className="mr-1 h-3 w-3 fill-yellow-500 text-yellow-500" />
											{manga.userTrackScore}
										</span>
									)}
								</div>
							</Badge>
						</div>
					)}
				</div>
			</div>
		</Link>
	);
}
