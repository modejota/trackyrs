export type PieDatum = { label: string; value: number };
export type YearSeasonBars = {
	year: number;
	Winter: number;
	Spring: number;
	Summer: number;
	Fall: number;
};
export type HistogramDatum = { label: string; value: number };
export type EpisodesHistogramDatum = { label: string; value: number };

export type PieChartCardProps = {
	title: string;
	data: PieDatum[];
	kind: "status-anime" | "status-manga" | "genre";
	footerText?: string;
};

export type HistogramCardProps = {
	title: string;
	data: HistogramDatum[];
	detailed?: { zero: number; half: number }[];
};

export type YearSeasonBarsCardProps = {
	title: string;
	data: YearSeasonBars[];
	footerText?: string;
};

export type EpisodesWatchedBarsCardProps = {
	title: string;
	data: EpisodesHistogramDatum[];
};
