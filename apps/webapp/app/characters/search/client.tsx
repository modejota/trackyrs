"use client";

import { Button } from "@trackyrs/ui/components/button";
import { Card, CardContent } from "@trackyrs/ui/components/card";
import { Input } from "@trackyrs/ui/components/input";
import { Label } from "@trackyrs/ui/components/label";
import { generateArray } from "@trackyrs/utils/src/react-list-key-generator";
import { CircleX, Search, Search as SearchIcon } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteCharacterSearch } from "@/app/api/characters/queries";
import { CardSkeleton } from "@/components/skeletons/card-skeleton";
import { SearchCharacterCard } from "../_components/search-character-card";

function useDebouncedState(initial: string, delay = 300) {
	const [value, setValue] = useState(initial);
	const [debouncedValue, setDebouncedValue] = useState(initial);
	useEffect(() => {
		const id = setTimeout(() => setDebouncedValue(value), delay);
		return () => clearTimeout(id);
	}, [value, delay]);
	return { value, setValue, debouncedValue } as const;
}

const placeholderCount = 20;

export function CharacterSearchClient() {
	const observerRef = useRef<HTMLDivElement | null>(null);
	const {
		value: name,
		setValue: setName,
		debouncedValue: debouncedName,
	} = useDebouncedState("", 300);

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
	} = useInfiniteCharacterSearch(debouncedName);

	const allCharacters = useMemo(
		() => data?.pages.flatMap((p: { characters: any[] }) => p.characters) ?? [],
		[data],
	);

	// Infinite scroll observer
	React.useEffect(() => {
		if (!observerRef.current) return;
		const el = observerRef.current;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{ threshold: 0.2 },
		);
		observer.observe(el);
		return () => observer.unobserve(el);
	}, [fetchNextPage, hasNextPage, isFetchingNextPage]);

	const onReset = () => setName("");

	return (
		<div className="space-y-6">
			<Card className="border-0 bg-transparent shadow-none">
				<CardContent className="space-y-4 p-0">
					<div className="grid w-full grid-cols-1 items-end gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
						<div className="flex w-full flex-col space-y-2 xl:col-span-2">
							<Label htmlFor="name" className="text-muted-foreground text-sm">
								Name
							</Label>
							<div className="relative w-full">
								<SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 z-10 h-4 w-4 transform text-muted-foreground" />
								<Input
									id="name"
									placeholder="Type a character name..."
									value={name}
									onChange={(e) => setName(e.target.value)}
									className="h-[38px] border border-input bg-white py-0 pl-10 leading-[38px]"
								/>
							</div>
						</div>

						<div className="flex w-full flex-col space-y-2">
							<Button
								variant="outline"
								onClick={onReset}
								className="h-[38px] w-full xl:w-1/2"
							>
								Reset
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{debouncedName ? (
				<div className="space-y-4">
					{isLoading ? null : isError ? (
						<div className="text-center">
							<div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-muted p-6">
								<CircleX className="h-10 w-10 text-muted-foreground" />
							</div>
							<h3 className="mb-2 font-semibold text-lg text-red-500">
								Failed to load search results
							</h3>
						</div>
					) : allCharacters.length === 0 ? (
						<div className="text-center">
							<div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-muted p-6">
								<Search className="h-10 w-10 text-muted-foreground" />
							</div>
							<h3 className="mb-2 font-semibold text-lg">
								No characters found with this name
							</h3>
						</div>
					) : (
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
							{allCharacters.map((c) => (
								<SearchCharacterCard key={c.id} character={c} />
							))}
							{isFetchingNextPage &&
								generateArray(
									"loading-next-character-search-cards",
									placeholderCount,
								).map((key) => <CardSkeleton key={key} />)}
						</div>
					)}

					{hasNextPage && (
						<div
							ref={observerRef}
							className="flex h-10 items-center justify-center"
						>
							{isFetchingNextPage && (
								<div className="flex items-center gap-2">
									<div className="h-4 w-4 animate-spin rounded-full border-primary border-b-2" />
								</div>
							)}
						</div>
					)}
				</div>
			) : null}
		</div>
	);
}
