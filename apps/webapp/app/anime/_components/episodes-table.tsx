"use client";

import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import type { AnimeEpisode } from "@trackyrs/database/schemas/myanimelist/anime/anime-episode-schema";
import { Badge } from "@trackyrs/ui/components/badge";
import { Button } from "@trackyrs/ui/components/button";
import { Input } from "@trackyrs/ui/components/input";
import { formatDateToLocaleDateStringOrNotYetAired } from "@trackyrs/utils/src/date-to-string";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useState } from "react";

interface EpisodesTableProps {
	episodes: AnimeEpisode[];
}

export function EpisodesTable({ episodes }: EpisodesTableProps) {
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [globalFilter, setGlobalFilter] = useState("");

	const columns: ColumnDef<AnimeEpisode>[] = [
		{
			accessorKey: "episodeNumber",
			header: "Episode",
			cell: ({ row }) => (
				<div className="min-w-[60px] text-center font-medium">
					{row.getValue("episodeNumber")}
				</div>
			),
			size: 80,
		},
		{
			accessorKey: "title",
			header: "Title",
			cell: ({ row }) => (
				<div className="min-w-[200px]">
					<div className="font-medium">{row.getValue("title")}</div>
				</div>
			),
		},
		{
			accessorKey: "titleRomaji",
			header: "Romaji Title",
			cell: ({ row }) => {
				const japaneseTitle = row.getValue("titleRomaji") as string | null;
				return (
					<div className="min-w-[150px] text-muted-foreground">
						{japaneseTitle || "—"}
					</div>
				);
			},
		},
		{
			accessorKey: "aired",
			header: "Aired Date",
			cell: ({ row }) => (
				<div className="min-w-[100px]">
					{formatDateToLocaleDateStringOrNotYetAired(row.getValue("aired"))}
				</div>
			),
		},
		{
			id: "indicators",
			header: "Type",
			cell: ({ row }) => {
				const filler = row.original.filler;
				const recap = row.original.recap;

				return (
					<div className="flex min-w-[80px] gap-1">
						{filler && (
							<Badge variant="secondary" className="text-xs">
								Filler
							</Badge>
						)}
						{recap && (
							<Badge variant="secondary" className="text-xs">
								Recap
							</Badge>
						)}
						{!filler && !recap && (
							<Badge variant="outline" className="text-xs">
								Canon
							</Badge>
						)}
					</div>
				);
			},
		},
	];

	const table = useReactTable({
		data: episodes,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onColumnFiltersChange: setColumnFilters,
		onGlobalFilterChange: setGlobalFilter,
		state: {
			columnFilters,
			globalFilter,
		},
		initialState: {
			pagination: {
				pageSize: 12,
			},
		},
	});

	if (episodes.length === 0) {
		return (
			<div className="py-12 text-center">
				<div className="mx-auto max-w-md">
					<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted p-4">
						<Search className="h-6 w-6 text-muted-foreground" />
					</div>
					<h3 className="mb-2 font-semibold text-lg">No Episodes Available</h3>
					<p className="text-muted-foreground text-sm">
						This anime doesn't have any episode information available yet.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Header with search and episode count */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h3 className="font-semibold text-lg">Episodes</h3>
					<p className="text-muted-foreground text-sm">
						{episodes.length} episode{episodes.length !== 1 ? "s" : ""} total
					</p>
				</div>

				{/* Search input */}
				<div className="relative w-full sm:max-w-md">
					<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
					<Input
						placeholder="Search episodes..."
						value={globalFilter ?? ""}
						onChange={(event) => setGlobalFilter(String(event.target.value))}
						className="pl-9"
					/>
				</div>
			</div>

			{/* Table container with horizontal scroll */}
			<div className="rounded-md border bg-card">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							{table.getHeaderGroups().map((headerGroup) => (
								<tr key={headerGroup.id} className="border-b bg-muted/50">
									{headerGroup.headers.map((header) => (
										<th
											key={header.id}
											className="h-12 px-3 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0"
										>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</th>
									))}
								</tr>
							))}
						</thead>
						<tbody>
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<tr
										key={row.id}
										className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
									>
										{row.getVisibleCells().map((cell) => (
											<td
												key={cell.id}
												className="p-3 align-middle [&:has([role=checkbox])]:pr-0"
											>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</td>
										))}
									</tr>
								))
							) : (
								<tr>
									<td colSpan={columns.length} className="h-24 text-center">
										<div className="flex flex-col items-center justify-center py-8">
											<Search className="mb-2 h-8 w-8 text-muted-foreground" />
											<p className="text-muted-foreground">
												No episodes found matching your search.
											</p>
										</div>
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Pagination */}
			{table.getPageCount() > 1 && (
				<div className="flex items-center justify-between px-2">
					<div className="flex-1 text-muted-foreground text-sm">
						Showing{" "}
						{table.getState().pagination.pageIndex *
							table.getState().pagination.pageSize +
							1}{" "}
						to{" "}
						{Math.min(
							(table.getState().pagination.pageIndex + 1) *
								table.getState().pagination.pageSize,
							table.getFilteredRowModel().rows.length,
						)}{" "}
						of {table.getFilteredRowModel().rows.length} episodes
					</div>
					<div className="flex items-center space-x-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
						>
							<ChevronLeft className="h-4 w-4" />
							Previous
						</Button>
						<div className="flex items-center space-x-1">
							<span className="font-medium text-sm">
								Page {table.getState().pagination.pageIndex + 1} of{" "}
								{table.getPageCount()}
							</span>
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
						>
							Next
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
