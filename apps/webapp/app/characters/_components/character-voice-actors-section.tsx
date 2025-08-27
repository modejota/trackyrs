"use client";

import { Badge } from "@trackyrs/ui/components/badge";
import { UsersRound } from "lucide-react";
import Image from "next/image";
import type { VoiceActorWithLanguage } from "@/app/api/characters/types";

interface CharacterVoiceActorsSectionProps {
	voiceActors: VoiceActorWithLanguage[];
}

function VoiceActorCard({
	voiceActor,
}: {
	voiceActor: VoiceActorWithLanguage;
}) {
	const { people, language } = voiceActor;
	return (
		<div className="overflow-hidden rounded-lg border bg-card">
			<div className="relative aspect-[3/4] overflow-hidden">
				<Image
					src={people.images}
					alt={people.name || "Voice Actor"}
					fill
					className="object-cover"
					sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
				/>
			</div>
			<div className="space-y-1.5 p-2.5">
				<h4 className="line-clamp-2 font-medium text-sm leading-tight">
					{people.name || "Unknown Voice Actor"}
				</h4>
				<div className="flex items-center justify-between">
					<Badge variant="outline" className="text-[10px]">
						<span>{language}</span>
					</Badge>
				</div>
			</div>
		</div>
	);
}

export function CharacterVoiceActorsSection({
	voiceActors,
}: CharacterVoiceActorsSectionProps) {
	if (voiceActors.length === 0) {
		return (
			<section aria-labelledby="character-voice-actors-heading">
				<div className="space-y-6">
					<h2
						id="character-voice-actors-heading"
						className="font-semibold text-2xl"
					>
						Voice Actors
					</h2>
					<div className="py-12 text-center">
						<div className="mx-auto max-w-md">
							<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted p-4">
								<UsersRound className="h-6 w-6 text-muted-foreground" />
							</div>
							<h3 className="mb-2 font-semibold text-lg">
								No Voice Actors Available
							</h3>
							<p className="text-muted-foreground text-sm">
								No voice actor information is available for this character.
							</p>
						</div>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section aria-labelledby="character-voice-actors-heading">
			<div className="space-y-6">
				<h2
					id="character-voice-actors-heading"
					className="font-semibold text-2xl"
				>
					Voice Actors
				</h2>
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
					{voiceActors.map((voiceActor) => (
						<VoiceActorCard
							key={`${voiceActor.people.id}-${voiceActor.language}`}
							voiceActor={voiceActor}
						/>
					))}
				</div>
			</div>
		</section>
	);
}
