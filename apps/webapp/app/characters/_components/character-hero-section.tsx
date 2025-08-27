"use client";

import type { Character } from "@trackyrs/database/schemas/myanimelist/character/character-schema";
import { Badge } from "@trackyrs/ui/components/badge";
import Image from "next/image";

interface CharacterHeroSectionProps {
	data: Character;
}

export function CharacterHeroSection({ data }: CharacterHeroSectionProps) {
	return (
		<div className="grid gap-6 lg:grid-cols-[300px_1fr]">
			{/* Character Image */}
			<div className="relative aspect-[3/4] overflow-hidden rounded-lg">
				<Image
					src={data.images}
					alt={data.name || "Character"}
					fill
					className="object-cover"
					sizes="(max-width: 1024px) 100vw, 300px"
					priority
				/>
			</div>

			{/* Character Information */}
			<div className="space-y-6">
				<div className="space-y-4">
					<div className="space-y-2">
						<h1
							id="character-hero-heading"
							className="font-bold text-3xl sm:text-4xl"
						>
							{data.name || "Unknown Character"}
						</h1>
						{data.nameKanji && (
							<p
								className="text-base text-muted-foreground sm:text-lg"
								lang="ja"
							>
								{data.nameKanji}
							</p>
						)}
					</div>

					{data.nicknames && data.nicknames.length > 0 && (
						<div className="space-y-2">
							<h3 className="font-semibold text-muted-foreground text-sm">
								Nicknames
							</h3>
							<div className="flex flex-wrap gap-2">
								{data.nicknames.map((nickname) => (
									<Badge
										key={nickname}
										variant="secondary"
										className="px-3 py-1 text-sm"
									>
										{nickname}
									</Badge>
								))}
							</div>
						</div>
					)}
				</div>

				{data.about && (
					<div className="space-y-2">
						<h3 className="font-semibold text-base text-foreground">About</h3>
						<p className="text-muted-foreground leading-relaxed">
							{data.about}
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
