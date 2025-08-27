"use client";

import type { People } from "@trackyrs/database/schemas/myanimelist/people-schema";
import { Badge } from "@trackyrs/ui/components/badge";
import Image from "next/image";

interface PeopleHeroSectionProps {
	data: People;
}

export function PeopleHeroSection({ data }: PeopleHeroSectionProps) {
	return (
		<div className="grid gap-6 lg:grid-cols-[300px_1fr]">
			<div className="relative aspect-[3/4] overflow-hidden rounded-lg">
				<Image
					src={data.images}
					alt={data.name || "Person"}
					fill
					className="object-cover"
					sizes="(max-width: 1024px) 100vw, 300px"
					priority
				/>
			</div>

			<div className="space-y-6">
				<div className="space-y-4">
					<div className="space-y-2">
						<h1
							id="people-hero-heading"
							className="font-bold text-3xl sm:text-4xl"
						>
							{data.name || "Unknown Person"}
						</h1>
						{(data.givenName || data.familyName) && (
							<p className="text-base text-muted-foreground sm:text-lg">
								{[data.givenName, data.familyName].filter(Boolean).join(" ")}
							</p>
						)}
					</div>
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
