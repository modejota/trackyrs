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
import { capitalizeSentenceWordByWord } from "@trackyrs/utils/src/string";
import { Cell, LabelList, Pie, PieChart } from "recharts";
import type { PieChartCardProps } from "./chart-types";

const PALETTE = [
	"#0ea5e9",
	"#a78bfa",
	"#f59e0b",
	"#10b981",
	"#ef4444",
	"#22d3ee",
	"#84cc16",
	"#e879f9",
	"#38bdf8",
	"#f97316",
	"#6366f1",
	"#14b8a6",
];
const STATUS_COLORS: Record<string, string> = {
	COMPLETED: "#16a34a",
	DROPPED: "#ef4444",
	WATCHING: "#0ea5e9",
	READING: "#0ea5e9",
	PAUSED: "#f59e0b",
	PLAN_TO_WATCH: "#6366f1",
	PLAN_TO_READ: "#6366f1",
	REWATCHING: "#a78bfa",
	REREADING: "#a78bfa",
};
const colorForStatus = (label: string) =>
	STATUS_COLORS[label.toUpperCase()] ?? "#22d3ee";

export function PieChartCard({
	title,
	data,
	kind,
	footerText,
}: PieChartCardProps) {
	if (!data || data.length === 0) return null;

	const pieData = data
		.filter((d) => d.value > 0)
		.map((d, i) => {
			const color =
				kind === "genre"
					? PALETTE[i % PALETTE.length]
					: colorForStatus(d.label);
			return {
				name: capitalizeSentenceWordByWord(d.label) ?? d.label,
				raw: d.label,
				value: d.value,
				color,
			};
		});

	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_240px]">
					<ChartContainer config={{}} className="h-56 w-full">
						<PieChart>
							<ChartTooltip content={<ChartTooltipContent />} />
							<Pie
								data={pieData}
								dataKey="value"
								nameKey="name"
								outerRadius={90}
							>
								{pieData.map((entry) => (
									<Cell key={`cell-${entry.raw}`} fill={entry.color} />
								))}
								<LabelList
									dataKey="value"
									position="inside"
									fill="#ffffff"
									fontSize={12}
								/>
							</Pie>
						</PieChart>
					</ChartContainer>
					<div className="columns-2 text-xs">
						{pieData.map((entry) => (
							<div
								key={`legend-${entry.raw}`}
								className="mb-2 inline-flex w-full break-inside-avoid items-center gap-2"
							>
								<span
									className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
									style={{ backgroundColor: entry.color }}
								/>
								<span className="text-muted-foreground">{entry.name}</span>
							</div>
						))}
					</div>
				</div>
				{footerText ? (
					<p className="mt-3 text-muted-foreground text-xs">{footerText}</p>
				) : null}
			</CardContent>
		</Card>
	);
}
