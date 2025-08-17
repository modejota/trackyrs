import type { CharacterWithRole } from "@trackyrs/database/types/anime-with-relations";
import { Badge } from "@trackyrs/ui/components/badge";
import { UsersRound } from "lucide-react";
import Image from "next/image";

interface CharactersGridProps {
	characters: CharacterWithRole[];
}

interface CharacterCardProps {
	data: CharacterWithRole;
	isMain: boolean;
}

function CharacterCard({ data, isMain = false }: CharacterCardProps) {
	// @ts-ignore linter doesn't recognize extension of drizzle base row when doing joins
	const role = data.role;

	return (
		<div className="h-full overflow-hidden rounded-lg border bg-card shadow transition-shadow duration-200 hover:shadow-md">
			<div
				className={`relative ${isMain ? "aspect-[3/4]" : "aspect-[3/4]"} overflow-hidden`}
			>
				<Image
					src={data.character.images}
					alt={`${data.character.name || "Character"} - ${role} character`}
					fill
					className="object-cover"
					sizes={
						isMain
							? "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
							: "(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
					}
				/>
			</div>

			<div className={`${isMain ? "p-3" : "p-2"} space-y-1`}>
				<h4
					className={`font-medium leading-tight ${isMain ? "text-sm sm:text-base" : "text-xs sm:text-sm"} truncate`}
					title={data.character.name || "Unknown Character"}
				>
					{data.character.name || "Unknown Character"}
				</h4>

				{data.character.nameKanji && (
					<p
						className={`text-muted-foreground ${isMain ? "text-xs sm:text-sm" : "text-xs"} truncate`}
						lang="ja"
						title={data.character.nameKanji}
					>
						{data.character.nameKanji}
					</p>
				)}

				{data.character.nicknames && data.character.nicknames.length > 0 && (
					<ul className="flex flex-wrap gap-1" aria-label="Character nicknames">
						{data.character.nicknames.map((nickname: string) => (
							<li key={nickname}>
								<Badge
									variant="secondary"
									className={`${isMain ? "px-2 py-0.5 text-xs" : "px-1.5 py-0.5 text-xs"} max-w-full truncate whitespace-nowrap`}
									title={nickname}
								>
									{nickname}
								</Badge>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
}

export function CharactersGrid({ characters }: CharactersGridProps) {
	if (!characters || characters.length === 0) {
		return (
			<div className="py-12 text-center">
				<div className="mx-auto max-w-md">
					<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted p-4">
						<UsersRound className="h-6 w-6 text-muted-foreground" />
					</div>
					<h3 className="mb-2 font-semibold text-lg">
						No Characters Available
					</h3>
					<p className="text-muted-foreground text-sm">
						There is no characters information available yet.
					</p>
				</div>
			</div>
		);
	}

	const mainCharacters = characters.filter(
		(char: CharacterWithRole) => (char as any).role === "Main",
	);
	const supportingCharacters = characters.filter(
		(char: CharacterWithRole) => (char as any).role === "Supporting",
	);

	return (
		<div className="space-y-8">
			{/* Main Characters Section */}
			{mainCharacters.length > 0 && (
				<section aria-labelledby="main-characters-heading">
					<div className="mb-4 flex items-center justify-between">
						<h3
							id="main-characters-heading"
							className="font-semibold text-base sm:text-lg"
						>
							Main Characters
						</h3>
						<span className="text-muted-foreground text-sm">
							{mainCharacters.length} character
							{mainCharacters.length !== 1 ? "s" : ""}
						</span>
					</div>

					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
						{mainCharacters.map((character: any) => {
							return (
								<CharacterCard
									key={`${character.animeId}-${character.characterId}-${character.role}`}
									data={character}
									isMain={true}
								/>
							);
						})}
					</div>
				</section>
			)}

			{/* Supporting Characters Section */}
			{supportingCharacters.length > 0 && (
				<section aria-labelledby="supporting-characters-heading">
					<div className="mb-4 flex items-center justify-between">
						<h3
							id="supporting-characters-heading"
							className="font-semibold text-base sm:text-lg"
						>
							Supporting Characters
						</h3>
						<span className="text-muted-foreground text-sm">
							{supportingCharacters.length} character
							{supportingCharacters.length !== 1 ? "s" : ""}
						</span>
					</div>

					<div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7">
						{supportingCharacters.map((character: CharacterWithRole) => {
							const charData = character as any;
							return (
								<CharacterCard
									key={`${charData.animeId}-${charData.characterId}-${charData.role}`}
									data={character}
									isMain={false}
								/>
							);
						})}
					</div>
				</section>
			)}

			{mainCharacters.length === 0 && supportingCharacters.length > 0 && (
				<div className="py-4 text-center" aria-live="polite">
					<p className="text-muted-foreground text-sm">
						Only supporting characters are available for this anime.
					</p>
				</div>
			)}

			{supportingCharacters.length === 0 && mainCharacters.length > 0 && (
				<div className="py-4 text-center" aria-live="polite">
					<p className="text-muted-foreground text-sm">
						Only main characters are available for this anime.
					</p>
				</div>
			)}
		</div>
	);
}
