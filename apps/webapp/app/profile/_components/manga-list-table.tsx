"use client";

import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Badge } from "@trackyrs/ui/components/badge";
import { Button } from "@trackyrs/ui/components/button";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ProfileMangaListItem } from "@/app/api/profile/types";

interface MangaListTableProps {
	title: string;
	items: ProfileMangaListItem[];
	showHeader?: boolean;
}

export function MangaListTable({
	title,
	items,
	showHeader = true,
}: MangaListTableProps) {
	const columns: ColumnDef<ProfileMangaListItem>[] = [
		{
			id: "thumb",
			header: "",
			cell: ({ row }) => {
				const src = row.original.images ?? "";
				const href = `/manga/${row.original.mangaId}`;
				return (
					<div className="h-12 w-9 overflow-hidden rounded-sm bg-muted">
						{src ? (
							<Link href={href} className="block h-full w-full">
								<Image
									src={src}
									alt={row.original.title ?? "Manga"}
									width={60}
									height={80}
									className="h-12 w-9 object-cover"
								/>
							</Link>
						) : (
							<Link
								href={href}
								className="block h-full w-full"
								aria-label={row.original.title ?? "Manga"}
							/>
						)}
					</div>
				);
			},
			size: 48,
		},
		{
			accessorKey: "title",
			header: "Title",
			cell: ({ row }) => {
				const name = (row.getValue("title") as string | null) ?? "—";
				const href = `/manga/${row.original.mangaId}`;
				return (
					<div className="min-w-[220px] font-medium">
						{name === "—" ? (
							<span>{name}</span>
						) : (
							<Link href={href} className="hover:underline">
								{name}
							</Link>
						)}
					</div>
				);
			},
			size: 300,
		},
		{
			accessorKey: "type",
			header: "Type",
			cell: ({ row }) => {
				const t = (row.getValue("type") as string | null) ?? "—";
				return (
					<Badge
						variant="secondary"
						className="min-w-[70px] justify-center text-xs"
					>
						{t}
					</Badge>
				);
			},
			size: 80,
		},
		{
			accessorKey: "score",
			header: "Score",
			cell: ({ row }) => {
				const score = row.getValue("score") as number | null;
				const hasScore = typeof score === "number" && !Number.isNaN(score);
				return (
					<div className="flex min-w-[60px] items-center gap-1 text-sm">
						<Star
							className={
								"h-4 w-4 " +
								(hasScore
									? "fill-yellow-500 text-yellow-500"
									: "text-muted-foreground")
							}
						/>
						<span>{hasScore ? score : "—"}</span>
					</div>
				);
			},
			size: 80,
		},
	];

	const table = useReactTable({
		data: items,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		initialState: {
			pagination: {
				pageSize: 10,
			},
		},
	});

	return (
		<div className="space-y-3">
			{showHeader && (
				<div className="flex items-end justify-between">
					<div>
						<h3 className="font-semibold text-lg">{title}</h3>
						<p className="text-muted-foreground text-sm">
							{items.length} item{items.length !== 1 ? "s" : ""}
						</p>
					</div>
				</div>
			)}

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
												: (header.column.columnDef.header as string)}
										</th>
									))}
								</tr>
							))}
						</thead>
						<tbody>
							{table.getRowModel().rows.map((row) => (
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
							))}
							{table.getRowModel().rows.length === 0 && (
								<tr>
									<td
										colSpan={columns.length}
										className="h-24 text-center text-muted-foreground"
									>
										No items.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{table.getPageCount() > 1 && (
				<div className="flex items-center justify-between px-2">
					<div className="text-muted-foreground text-sm">
						Page {table.getState().pagination.pageIndex + 1} of{" "}
						{table.getPageCount()}
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
						>
							Previous
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
						>
							Next
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
