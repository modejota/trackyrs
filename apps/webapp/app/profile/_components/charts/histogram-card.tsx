"use client";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@trackyrs/ui/components/card";
import { ChartContainer, ChartTooltip } from "@trackyrs/ui/components/chart";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import type { HistogramCardProps } from "./chart-types";

function lerp(a: number, b: number, t: number) {
	return a + (b - a) * t;
}
function hsl(h: number, s: number, l: number) {
	return `hsl(${h} ${s}% ${l}%)`;
}
function colorForScore(score: number) {
	const clamped = Math.max(0, Math.min(10, score));
	const t = clamped / 10;
	const h = lerp(0, 142, t);
	return hsl(h, 75, 50);
}

export function HistogramCard({ title, data }: HistogramCardProps) {
	if (!data || data.length === 0 || data.every((d) => d.value === 0))
		return null;
	const numericData = data.map((d) => ({
		...d,
		x: Number.parseFloat(d.label),
	})) as Array<{ label: string; value: number; x: number }>;
	const ticks = Array.from({ length: 11 }, (_, i) => i);

	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<ChartContainer config={{}} className="h-56 w-full">
					<BarChart
						data={numericData}
						margin={{ left: 18, right: 16, top: 4, bottom: 28 }}
					>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="x"
							type="number"
							domain={[-0.25, 10.25]}
							ticks={ticks}
							tickLine={false}
							axisLine={false}
							tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
							tickFormatter={(v: number) => `${v}\u2605`}
							label={{
								value: "Score",
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
						<ChartTooltip
							content={({ payload }) => {
								const p: any = payload?.[0]?.payload;
								const val = p?.x as number | undefined;
								return (
									<div className="rounded-md border bg-popover p-2 text-popover-foreground text-xs shadow-sm">
										<div className="mb-1 font-medium">{val} ★</div>
										<div className="flex items-center justify-between gap-6">
											<span className="text-muted-foreground">Items</span>
											<span className="font-mono">{p?.value ?? 0}</span>
										</div>
									</div>
								);
							}}
						/>
						<Bar dataKey="value" radius={4}>
							{numericData.map((d) => (
								<Cell key={`cell-${d.label}`} fill={colorForScore(d.x)} />
							))}
						</Bar>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
