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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { YearSeasonBarsCardProps } from "./chart-types";

export function YearSeasonBarsCard({
	title,
	data,
	footerText,
}: YearSeasonBarsCardProps) {
	if (!data || data.length === 0) return null;
	const colors = {
		Winter: "#3b82f6",
		Spring: "#22c55e",
		Summer: "#ef4444",
		Fall: "#f59e0b",
	} as const;

	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<ChartContainer config={{}} className="h-56 w-full">
					<BarChart
						data={data}
						margin={{ left: 12, right: 8, top: 4, bottom: 24 }}
						barCategoryGap={16}
						barGap={6}
					>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="year"
							tickLine={false}
							axisLine={false}
							tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
							label={{
								value: "Year",
								position: "bottom",
								style: { fill: "hsl(var(--muted-foreground))", fontSize: 12 },
							}}
						/>
						<YAxis
							allowDecimals={false}
							tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
							label={{
								value: "Tracks",
								angle: -90,
								position: "insideLeft",
								style: { fill: "hsl(var(--muted-foreground))", fontSize: 12 },
							}}
						/>
						<ChartTooltip content={<ChartTooltipContent />} />
						<Bar dataKey="Winter" fill={colors.Winter} radius={2} />
						<Bar dataKey="Spring" fill={colors.Spring} radius={2} />
						<Bar dataKey="Summer" fill={colors.Summer} radius={2} />
						<Bar dataKey="Fall" fill={colors.Fall} radius={2} />
					</BarChart>
				</ChartContainer>
				{footerText ? (
					<p className="mt-3 text-muted-foreground text-xs">{footerText}</p>
				) : null}
			</CardContent>
		</Card>
	);
}
