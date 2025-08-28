"use client";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@trackyrs/ui/components/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@trackyrs/ui/components/chart";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import type { EpisodesWatchedBarsCardProps } from "./chart-types";

export function EpisodesWatchedBarsCard({
	title,
	data,
}: EpisodesWatchedBarsCardProps) {
	if (!data || data.length === 0 || data.every((d) => d.value === 0))
		return null;
	return (
		<Card className="sm:col-span-2">
			<CardHeader>
				<CardTitle>{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<ChartContainer config={{}} className="h-56 w-full">
					<BarChart
						data={data}
						margin={{ left: 12, right: 8, top: 4, bottom: 24 }}
					>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="label"
							tickLine={false}
							axisLine={false}
							tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
							label={{
								value: "Episodes watched",
								position: "bottom",
								style: { fill: "hsl(var(--muted-foreground))", fontSize: 12 },
							}}
						/>
						<YAxis
							allowDecimals={false}
							tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
							label={{
								value: "Animes",
								angle: -90,
								position: "insideLeft",
								style: { fill: "hsl(var(--muted-foreground))", fontSize: 12 },
							}}
						/>
						<ChartTooltip
							content={
								<ChartTooltipContent
									labelFormatter={(label?: string | number) =>
										label !== undefined && label !== null
											? `Episodes: ${label}`
											: ""
									}
								/>
							}
						/>
						<Bar dataKey="value" name="Animes" radius={4}>
							{data.map((d) => (
								<Cell key={`cell-ep-${d.label}`} fill="#60a5fa" />
							))}
						</Bar>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
