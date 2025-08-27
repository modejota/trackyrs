"use client";

import type { Character } from "@trackyrs/database/schemas/myanimelist/character/character-schema";
import Image from "next/image";
import Link from "next/link";

export function SearchCharacterCard({ character }: { character: Character }) {
	const imageUrl = character.images;
	return (
		<Link href={`/characters/${character.id}`} className="group block">
			<div className="flex h-full flex-col overflow-hidden rounded-lg bg-card shadow transition-shadow duration-200 hover:shadow-md">
				<div className="relative aspect-[3/4] overflow-hidden">
					<Image
						src={imageUrl}
						alt={`${character.name} image`}
						fill
						className="object-cover"
						sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
					/>
				</div>
				<div className="p-3">
					<h3 className="line-clamp-2 font-medium text-sm leading-tight transition-colors group-hover:text-primary">
						{character.name}
					</h3>
				</div>
			</div>
		</Link>
	);
}
