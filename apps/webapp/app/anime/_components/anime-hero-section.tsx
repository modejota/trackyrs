import type { Anime } from "@trackyrs/database/schemas/myanimelist/anime/anime-schema";
import Image from "next/image";

interface AnimeHeroSectionProps {
	data: Anime;
}

export function AnimeHeroSection({ data }: AnimeHeroSectionProps) {
	return (
		<div className="flex flex-col gap-6 lg:flex-row">
			{/* Image Section - Fixed dimensions */}
			<div className="relative mx-auto w-full max-w-[320px] lg:mx-0 lg:w-80 lg:flex-shrink-0">
				<div className="relative aspect-[3/4] w-full">
					{data.images ? (
						<Image
							src={data.images}
							alt={`Cover image for ${data.title}${data.titleEnglish && data.titleEnglish !== data.title ? ` (${data.titleEnglish})` : ""}`}
							fill
							className="object-cover"
							sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
							priority
						/>
					) : (
						<div
							className="flex h-full w-full items-center justify-center bg-muted"
							role="img"
							aria-label={`No cover image available for ${data.title}`}
						>
							<div className="text-center text-foreground/70">
								<div className="mb-2 text-4xl" aria-hidden="true">
									📺
								</div>
								<p className="text-sm">No Image Available</p>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Content Section */}
			<div className="min-w-0 flex-1">
				<div className="space-y-4">
					{/* Title */}
					<header>
						<h1
							id="anime-hero-heading"
							className="mb-2 font-bold text-2xl text-foreground leading-tight sm:text-3xl lg:text-4xl"
						>
							{data.title}
						</h1>
						{data.titleEnglish && data.titleEnglish !== data.title && (
							<p className="text-base text-foreground/70 sm:text-lg">
								{data.titleEnglish}
							</p>
						)}
						{data.titleJapanese && (
							<p className="font-medium text-foreground/70 text-sm" lang="ja">
								{data.titleJapanese}
							</p>
						)}
					</header>

					{/* Synopsis */}
					<div className="space-y-2">
						<h2 className="font-semibold text-base sm:text-lg">Synopsis</h2>
						<div className="whitespace-pre-wrap text-foreground/70 text-sm leading-relaxed">
							{data.synopsis ??
								"No synopsis information has been added to this title."}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
