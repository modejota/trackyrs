import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import type { Anime } from "@trackyrs/database/schemas/myanimelist/anime/anime-schema";
import { UserTracksAnimeStatus } from "@trackyrs/database/types/anime-tracks";
import { Badge } from "@trackyrs/ui/components/badge";
import { Button } from "@trackyrs/ui/components/button";
import { Calendar } from "@trackyrs/ui/components/calendar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@trackyrs/ui/components/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@trackyrs/ui/components/dropdown-menu";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@trackyrs/ui/components/form";
import { Input } from "@trackyrs/ui/components/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@trackyrs/ui/components/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@trackyrs/ui/components/select";
import { ErrorToast } from "@trackyrs/ui/components/toasts/error-toast";
import { SuccessToast } from "@trackyrs/ui/components/toasts/success-toast";
import { cn } from "@trackyrs/ui/lib/utils";
import { capitalize } from "@trackyrs/utils/src/string";
import { format } from "date-fns";
import { ArrowRight, MoreVertical, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
	useCreateAnimeTrack,
	useDeleteAnimeTrack,
} from "@/app/api/anime-tracks/mutations";
import { useUserAnimeTrack } from "@/app/api/anime-tracks/queries";
import { authClient } from "@/lib/auth-client";

interface AnimeHeroSectionProps {
	data: Anime;
}

export function AnimeHeroSection({ data }: AnimeHeroSectionProps) {
	const { data: session } = authClient.useSession();
	const [open, setOpen] = React.useState(false);
	const [confirmOpen, setConfirmOpen] = React.useState(false);
	const createTrack = useCreateAnimeTrack(data.id);
	const deleteTrack = useDeleteAnimeTrack(data.id);
	const trackQuery = useUserAnimeTrack(data.id);
	const qc = useQueryClient();
	// Prevent ultra-fast double submissions/deletes before mutation state flips
	const submitLockRef = React.useRef(false);
	const deleteLockRef = React.useRef(false);

	const formSchema = z.object({
		status: z.enum(UserTracksAnimeStatus),
		score: z.number().min(0, "Min 0").max(10, "Max 10").optional(),
		episodesWatched: z.number().min(0, "Must be >= 0").optional(),
		startDate: z.string().optional(),
		endDate: z.string().optional(),
		rewatches: z.number().int().min(0).optional(),
	});

	type FormData = z.infer<typeof formSchema>;

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			status: UserTracksAnimeStatus.PLAN_TO_WATCH,
			score: undefined,
			episodesWatched: undefined,
			startDate: undefined,
			endDate: undefined,
			rewatches: undefined,
		},
	});

	function onSubmit(values: FormData) {
		// Synchronous guard to avoid race before isPending updates
		if (submitLockRef.current || createTrack.isPending) return;
		submitLockRef.current = true;
		const wasEditing = Boolean(existingTrack);
		createTrack.mutate(values, {
			onSuccess: async () => {
				setOpen(false);
				await qc.invalidateQueries({ queryKey: ["anime", data.id, "track"] });
				toast.custom(
					() => (
						<SuccessToast
							message={
								wasEditing
									? "Track updated successfully"
									: "Track created successfully"
							}
						/>
					),
					{ id: `anime-track-${data.id}-save` },
				);
			},
			onError: () => {
				toast.custom(() => <ErrorToast message={"Failed to create track"} />, {
					id: `anime-track-${data.id}-save`,
				});
			},
			onSettled: () => {
				submitLockRef.current = false;
			},
		});
	}

	const numberEpisodes = data.numberEpisodes ?? null;
	React.useEffect(() => {
		const sub = form.watch((value, info) => {
			if (
				info.name === "status" &&
				value.status === UserTracksAnimeStatus.COMPLETED
			) {
				if (typeof numberEpisodes === "number" && numberEpisodes > 0) {
					form.setValue("episodesWatched", numberEpisodes, {
						shouldDirty: true,
					});
				}
			}
		});
		return () => sub.unsubscribe();
	}, [form, numberEpisodes]);

	const existingTrack = trackQuery.data?.data?.track ?? null;

	React.useEffect(() => {
		if (open && existingTrack) {
			form.reset({
				status: (existingTrack.status ??
					UserTracksAnimeStatus.PLAN_TO_WATCH) as FormData["status"],
				score: existingTrack.score ?? undefined,
				episodesWatched: existingTrack.episodesWatched ?? undefined,
				startDate: existingTrack.startDate ?? undefined,
				endDate: existingTrack.endDate ?? undefined,
				rewatches: existingTrack.rewatches ?? undefined,
			});
		}
	}, [open, existingTrack, form]);

	function prettifyStatus(s: UserTracksAnimeStatus | null | undefined) {
		if (!s) return "Plan to Watch";
		return s
			.split("_")
			.map((part) => capitalize(part.toLowerCase()))
			.join(" ");
	}

	function toEmbedUrl(raw: string): string | null {
		try {
			const url = new URL(raw);
			const host = url.hostname.replace(/^www\./, "").toLowerCase();
			if (host === "youtu.be") {
				const id = url.pathname.split("/").filter(Boolean)[0];
				if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
			}
			if (
				host === "youtube.com" ||
				host === "m.youtube.com" ||
				host === "music.youtube.com" ||
				host === "youtube-nocookie.com"
			) {
				if (url.pathname.startsWith("/embed/")) {
					return `https://www.youtube-nocookie.com${url.pathname}`;
				}
				const id = url.searchParams.get("v");
				if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
			}
			return url.toString();
		} catch {
			return null;
		}
	}

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

				<div className="mt-3 flex flex-col gap-2 lg:justify-start">
					<Dialog open={open} onOpenChange={setOpen}>
						{!existingTrack && (
							<DialogTrigger asChild>
								<Button variant="secondary" className="w-full cursor-pointer">
									Track this anime
								</Button>
							</DialogTrigger>
						)}
						<DialogContent className="sm:max-w-xl">
							{session ? (
								<>
									<DialogHeader>
										<DialogTitle>
											{existingTrack ? "Edit your track" : "Track this anime"}
										</DialogTitle>
										<DialogDescription>
											Set your progress, score, and status.
										</DialogDescription>
									</DialogHeader>
									<Form {...form}>
										<form
											onSubmit={form.handleSubmit(onSubmit)}
											className="space-y-4"
										>
											<fieldset
												disabled={createTrack.isPending}
												className="space-y-4"
											>
												{/* Row 1: Status, Episodes Watched, Score */}
												<div className="flex flex-col gap-2 sm:flex-row">
													<div className="flex-1">
														<FormField
															control={form.control}
															name="status"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Status</FormLabel>
																	<FormControl>
																		<Select
																			value={field.value}
																			onValueChange={field.onChange}
																		>
																			<SelectTrigger className="w-full">
																				<SelectValue placeholder="Select status" />
																			</SelectTrigger>
																			<SelectContent>
																				{Object.values(
																					UserTracksAnimeStatus,
																				).map((s) => (
																					<SelectItem key={s} value={s}>
																						{prettifyStatus(s)}
																					</SelectItem>
																				))}
																			</SelectContent>
																		</Select>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
													</div>

													<div className="w-48">
														<FormField
															control={form.control}
															name="episodesWatched"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Episodes watched</FormLabel>
																	<FormControl>
																		<Input
																			type="number"
																			min={0}
																			placeholder="e.g. 5"
																			value={field.value ?? ""}
																			onChange={(
																				e: React.ChangeEvent<HTMLInputElement>,
																			) =>
																				field.onChange(
																					Number.isNaN(e.target.valueAsNumber)
																						? undefined
																						: e.target.valueAsNumber,
																				)
																			}
																		/>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
													</div>

													<div className="w-32">
														<FormField
															control={form.control}
															name="score"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Score</FormLabel>
																	<FormControl>
																		<Input
																			type="number"
																			min={0}
																			max={10}
																			step={0.5}
																			placeholder="0-10"
																			value={field.value ?? ""}
																			onChange={(
																				e: React.ChangeEvent<HTMLInputElement>,
																			) =>
																				field.onChange(
																					Number.isNaN(e.target.valueAsNumber)
																						? undefined
																						: e.target.valueAsNumber,
																				)
																			}
																		/>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
													</div>
												</div>

												{/* Row 2: startDate, endDate, rewatches */}
												<div className="flex flex-col gap-2 sm:flex-row">
													<div className="flex-1">
														<FormField
															control={form.control}
															name="startDate"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Start date</FormLabel>
																	<Popover>
																		<PopoverTrigger asChild>
																			<FormControl>
																				<Button
																					variant="outline"
																					type="button"
																					className={cn(
																						"w-full justify-start text-left font-normal",
																						!field.value &&
																							"text-muted-foreground",
																					)}
																				>
																					{field.value
																						? format(
																								new Date(field.value),
																								"PPP",
																							)
																						: "Select start date"}
																				</Button>
																			</FormControl>
																		</PopoverTrigger>
																		<PopoverContent
																			className="w-auto p-0"
																			align="start"
																		>
																			<Calendar
																				mode="single"
																				selected={
																					field.value
																						? new Date(field.value)
																						: undefined
																				}
																				onSelect={(date) => {
																					if (date) {
																						const normalized = new Date(
																							Date.UTC(
																								date.getFullYear(),
																								date.getMonth(),
																								date.getDate(),
																								0,
																								0,
																								0,
																							),
																						);
																						field.onChange(
																							normalized.toISOString(),
																						);
																					} else {
																						field.onChange(undefined);
																					}
																				}}
																				autoFocus
																				captionLayout="dropdown"
																			/>
																		</PopoverContent>
																	</Popover>
																	<FormMessage />
																</FormItem>
															)}
														/>
													</div>

													<div className="flex-1">
														<FormField
															control={form.control}
															name="endDate"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>End date</FormLabel>
																	<Popover>
																		<PopoverTrigger asChild>
																			<FormControl>
																				<Button
																					variant="outline"
																					type="button"
																					className={cn(
																						"w-full justify-start text-left font-normal",
																						!field.value &&
																							"text-muted-foreground",
																					)}
																				>
																					{field.value
																						? format(
																								new Date(field.value),
																								"PPP",
																							)
																						: "Select end date"}
																				</Button>
																			</FormControl>
																		</PopoverTrigger>
																		<PopoverContent
																			className="w-auto p-0"
																			align="start"
																		>
																			<Calendar
																				mode="single"
																				selected={
																					field.value
																						? new Date(field.value)
																						: undefined
																				}
																				onSelect={(date) => {
																					if (date) {
																						const normalized = new Date(
																							Date.UTC(
																								date.getFullYear(),
																								date.getMonth(),
																								date.getDate(),
																								0,
																								0,
																								0,
																							),
																						);
																						field.onChange(
																							normalized.toISOString(),
																						);
																					} else {
																						field.onChange(undefined);
																					}
																				}}
																				autoFocus
																				captionLayout="dropdown"
																			/>
																		</PopoverContent>
																	</Popover>
																	<FormMessage />
																</FormItem>
															)}
														/>
													</div>

													<div className="w-32">
														<FormField
															control={form.control}
															name="rewatches"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Rewatches</FormLabel>
																	<FormControl>
																		<Input
																			type="number"
																			min={0}
																			step={1}
																			placeholder="0"
																			value={field.value ?? ""}
																			onChange={(
																				e: React.ChangeEvent<HTMLInputElement>,
																			) =>
																				field.onChange(
																					Number.isNaN(e.target.valueAsNumber)
																						? undefined
																						: Math.floor(
																								e.target.valueAsNumber,
																							),
																				)
																			}
																		/>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
													</div>
												</div>
											</fieldset>

											<div className="flex justify-end gap-2">
												<Button
													type="button"
													variant="ghost"
													onClick={() => setOpen(false)}
												>
													Cancel
												</Button>
												<Button type="submit" disabled={createTrack.isPending}>
													Save
												</Button>
											</div>
										</form>
									</Form>
								</>
							) : (
								<div className="space-y-4">
									<DialogHeader>
										<DialogTitle>Sign in to track</DialogTitle>
										<DialogDescription>
											You need an account to track your anime progress.
										</DialogDescription>
									</DialogHeader>
									<div className="flex justify-end gap-2">
										<Button asChild variant="ghost">
											<Link href="/login">Log in</Link>
										</Button>
										<Button asChild>
											<Link href="/register">Sign up</Link>
										</Button>
									</div>
								</div>
							)}
						</DialogContent>
					</Dialog>

					{/* Track info */}
					{existingTrack && (
						<div className="w-full rounded-md border bg-muted/30 p-3">
							<div className="grid grid-cols-[1fr_auto] items-center gap-2">
								<div className="flex w-full items-center justify-evenly text-center text-sm">
									<span className="font-medium">
										{prettifyStatus(
											existingTrack.status as UserTracksAnimeStatus,
										)}
									</span>
									<span className="font-medium">
										Eps: {existingTrack.episodesWatched ?? 0}
									</span>
									{existingTrack.score !== null && (
										<span className="inline-flex items-center font-medium">
											<Star className="mr-1 size-4 fill-yellow-500 text-yellow-500" />
											{existingTrack.score}
										</span>
									)}
								</div>

								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" className="size-9 p-0">
											<MoreVertical className="size-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem onClick={() => setOpen(true)}>
											Edit track
										</DropdownMenuItem>
										<DropdownMenuItem
											variant="destructive"
											onClick={() => setConfirmOpen(true)}
										>
											Delete track
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</div>
					)}

					{/* Confirm Delete Dialog */}
					{existingTrack && (
						<Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
							<DialogContent className="sm:max-w-md">
								<DialogHeader>
									<DialogTitle>Delete track</DialogTitle>
									<DialogDescription>
										Are you sure you want to delete your track for this anime?
									</DialogDescription>
								</DialogHeader>
								<div className="flex justify-end gap-2">
									<Button variant="ghost" onClick={() => setConfirmOpen(false)}>
										Cancel
									</Button>
									<Button
										variant="destructive"
										disabled={deleteTrack.isPending}
										onClick={() => {
											if (deleteLockRef.current || deleteTrack.isPending)
												return;
											deleteLockRef.current = true;
											deleteTrack.mutate(undefined, {
												onSuccess: async () => {
													setConfirmOpen(false);
													await qc.invalidateQueries({
														queryKey: ["anime", data.id, "track"],
													});
													toast.custom(
														() => (
															<SuccessToast message="Track deleted successfully" />
														),
														{ id: `anime-track-${data.id}-delete` },
													);
												},
												onError: () => {
													toast.custom(
														() => (
															<ErrorToast
																message={
																	"Failed to delete track. Please try later on."
																}
															/>
														),
														{ id: `anime-track-${data.id}-delete` },
													);
												},
												onSettled: () => {
													deleteLockRef.current = false;
												},
											});
										}}
									>
										Delete
									</Button>
								</div>
							</DialogContent>
						</Dialog>
					)}
				</div>
			</div>

			{/* Content Section */}
			<div className="min-w-0 flex-1">
				<div className="space-y-4">
					{/* Title */}
					<header className="lg:flex lg:items-start lg:justify-between">
						<div>
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
						</div>
						{typeof data.referenceScore === "number" && (
							<div className="mt-1 flex items-center gap-2 lg:mt-0">
								<Star className="size-8 fill-yellow-500 text-yellow-500" />
								<span className="font-bold text-2xl sm:text-3xl lg:text-4xl">
									{Number(data.referenceScore).toFixed(2)}
								</span>
							</div>
						)}
					</header>

					{/* Synopsis */}
					<div className="space-y-2">
						<h2 className="font-semibold text-base sm:text-lg">Synopsis</h2>
						<div className="whitespace-pre-wrap text-foreground/70 text-sm leading-relaxed">
							{data.synopsis ??
								"No synopsis information has been added to this title."}
						</div>
						{data.trailer ? (
							<Dialog>
								<DialogTrigger asChild>
									<Badge
										asChild
										variant="secondary"
										className="mt-2 cursor-pointer px-3 py-1.5 text-sm"
									>
										<button
											type="button"
											aria-label="Watch trailer"
											className="inline-flex items-center gap-1.5"
										>
											Watch trailer
											<ArrowRight className="size-4" aria-hidden="true" />
										</button>
									</Badge>
								</DialogTrigger>
								<DialogContent className="overflow-hidden p-0 sm:max-w-3xl">
									<DialogHeader className="hidden px-6 py-4">
										<DialogTitle>Trailer</DialogTitle>
										<DialogDescription className="sr-only">
											Watch the trailer for {data.title}
										</DialogDescription>
									</DialogHeader>
									<div className="relative aspect-[16/9] w-full">
										<iframe
											title={`${data.title} trailer`}
											src={toEmbedUrl(data.trailer) ?? data.trailer}
											allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
											allowFullScreen
											referrerPolicy="strict-origin-when-cross-origin"
											className="absolute inset-0 h-full w-full"
										/>
									</div>
								</DialogContent>
							</Dialog>
						) : null}
					</div>
				</div>
			</div>
		</div>
	);
}
