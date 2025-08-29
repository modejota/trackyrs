"use client";

import { Button } from "@trackyrs/ui/components/button";
import { Command, CommandInput } from "@trackyrs/ui/components/command";
import {
	Dialog,
	DialogContent,
	DialogTitle,
} from "@trackyrs/ui/components/dialog";
import { X as CloseIcon, Search as SearchIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useUnifiedSearch } from "@/app/api/search/queries";

export default function GlobalSearch() {
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState("");
	const [debounced, setDebounced] = useState("");

	useEffect(() => {
		const id = setTimeout(() => setDebounced(value.trim()), 400);
		return () => clearTimeout(id);
	}, [value]);

	const { data, isFetching, isError, refetch } = useUnifiedSearch(debounced, 6);

	return (
		<div className="inline-block">
			<Button
				variant="ghost"
				size="icon"
				aria-label="Open search"
				className="size-8"
				onClick={() => setOpen(true)}
			>
				<SearchIcon className="size-5" />
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent
					showCloseButton={false}
					className={(() => {
						const colCount = data
							? [
									data.anime.length > 0,
									data.manga.length > 0,
									data.people.length > 0,
									data.characters.length > 0,
								].filter(Boolean).length
							: 2; // a sensible default while loading

						const widthClass = [
							"sm:max-w-[640px]", // sm container
							"md:max-w-[768px]", // md container
							"lg:max-w-[1024px]", // lg container
							"xl:max-w-[1280px]", // xl container
							"2xl:max-w-[1536px]", // 2xl container
						].join(" ");

						return [
							"h-[100svh] w-[100vw] max-w-none p-0",
							"top-0 left-0 translate-x-0 translate-y-0",
							"rounded-none border-0",
							"sm:h-auto sm:w-full",
							"sm:-translate-x-1/2 sm:-translate-y-1/2 sm:top-1/2 sm:left-1/2",
							"sm:rounded-lg sm:border",
							widthClass,
						].join(" ");
					})()}
				>
					<DialogTitle className="sr-only">Search</DialogTitle>
					<Command className="h-full w-full">
						<div className="relative">
							<CommandInput
								placeholder="Type to search"
								value={value}
								onValueChange={setValue}
								autoFocus
								className="pr-12"
							/>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="-translate-y-1/2 absolute top-1/2 right-2 sm:hidden"
								aria-label="Close search"
								onClick={() => setOpen(false)}
							>
								<CloseIcon className="size-5" />
							</Button>
						</div>

						<div className="flex-1 overflow-y-auto">
							{!debounced && (
								<div className="flex items-center justify-center p-6 text-center text-muted-foreground text-sm">
									Start typing to search.
								</div>
							)}
							{debounced && isFetching && (
								<div className="p-6 text-center text-muted-foreground text-sm">
									Searching…
								</div>
							)}
							{debounced && isError && (
								<div className="p-6 text-center">
									<p className="text-muted-foreground text-sm">
										Something went wrong.
									</p>
									<Button size="sm" className="mt-2" onClick={() => refetch()}>
										Try again
									</Button>
								</div>
							)}

							{debounced &&
								data &&
								(() => {
									const columns = [
										data.anime.length > 0 && {
											title: "Anime",
											items: data.anime.map((a) => ({
												key: `anime-${a.id}`,
												href: `/anime/${a.id}`,
												title: a.title,
												image: a.images,
												subtitle:
													a.titleEnglish || a.titleJapanese || undefined,
											})),
										},
										data.manga.length > 0 && {
											title: "Manga",
											items: data.manga.map((m) => ({
												key: `manga-${m.id}`,
												href: `/manga/${m.id}`,
												title: m.title,
												image: m.images,
												subtitle:
													m.titleEnglish || m.titleJapanese || undefined,
											})),
										},
										data.people.length > 0 && {
											title: "People",
											items: data.people.map((p) => ({
												key: `people-${p.id}`,
												href: `/people/${p.id}`,
												title: p.name,
												image: p.images,
												subtitle:
													[p.givenName, p.familyName]
														.filter(Boolean)
														.join(" ") || undefined,
											})),
										},
										data.characters.length > 0 && {
											title: "Characters",
											items: data.characters.map((ch) => ({
												key: `character-${ch.id}`,
												href: `/characters/${ch.id}`,
												title: ch.name || "Unknown Character",
												image: ch.images,
												subtitle: ch.nameKanji || undefined,
											})),
										},
									].filter(Boolean) as {
										title: string;
										items: {
											key: string;
											href: string;
											title: string;
											subtitle?: string;
											image: string;
										}[];
									}[];

									const colCount = columns.length;
									const gridCols =
										colCount <= 1
											? "grid-cols-1"
											: colCount === 2
												? "grid-cols-1 md:grid-cols-2"
												: colCount === 3
													? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
													: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";

									if (colCount === 0) {
										return (
											<div className="flex items-center justify-center p-6 text-center text-muted-foreground text-sm">
												No results found{value ? ` for \"${value}\"` : ""}.
											</div>
										);
									}

									return (
										<div className={`grid gap-4 p-3 ${gridCols}`}>
											{columns.map((col) => (
												<EntityColumn
													key={col.title}
													title={col.title}
													items={col.items}
													onItemClick={() => setOpen(false)}
												/>
											))}
										</div>
									);
								})()}
						</div>
					</Command>
				</DialogContent>
			</Dialog>
		</div>
	);
}

function EntityColumn({
	title,
	items,
	onItemClick,
}: {
	title: string;
	items: {
		key: string;
		href: string;
		title: string;
		subtitle?: string;
		image: string;
	}[];
	onItemClick?: () => void;
}) {
	return (
		<div>
			<div className="px-3 py-2 font-medium text-muted-foreground text-xs">
				{title}
			</div>
			<div className="space-y-1">
				{items.slice(0, 8).map((item) => (
					<Link
						key={item.key}
						href={item.href}
						className="block"
						prefetch={false}
						onClick={onItemClick}
					>
						<div className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent">
							<Image
								src={item.image}
								alt={item.title}
								width={48}
								height={64}
								className="h-16 w-12 shrink-0 rounded-sm object-fill"
							/>
							<div className="min-w-0">
								<div className="truncate text-sm">{item.title}</div>
								{item.subtitle && (
									<div className="truncate text-muted-foreground text-xs">
										{item.subtitle}
									</div>
								)}
							</div>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
