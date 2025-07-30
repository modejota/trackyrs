import { MultiBar, type SingleBar } from "cli-progress";

export interface ProgressBarOptions {
	name: string;
	total: number;
	format?: string;
}

export interface ProgressUpdate {
	processed: number;
	inserted?: number;
	updated?: number;
	skipped?: number;
	errors?: number;
}

export class ProgressManager {
	private static instance: ProgressManager | null = null;
	private multiBar: MultiBar | null = null;
	private progressBars: Map<string, SingleBar> = new Map();

	private constructor() {}

	public static getInstance(): ProgressManager {
		if (!ProgressManager.instance) {
			ProgressManager.instance = new ProgressManager();
		}
		return ProgressManager.instance;
	}

	public createProgressBar(options: ProgressBarOptions): string {
		if (!this.multiBar) {
			this.multiBar = new MultiBar({
				clearOnComplete: false,
				hideCursor: true,
				format:
					options.format ||
					"{name} |{bar}| {value}/{total} ({percentage}%) | I:{inserted} U:{updated} S:{skipped} E:{errors} | {duration_formatted}",
			});
		}

		const progressBar = this.multiBar.create(options.total, 0, {
			name: options.name.padEnd(20),
			inserted: 0,
			updated: 0,
			skipped: 0,
			errors: 0,
		});

		this.progressBars.set(options.name, progressBar);
		return options.name;
	}

	public updateProgress(name: string, update: ProgressUpdate): void {
		const progressBar = this.progressBars.get(name);
		if (progressBar) {
			const payload: Record<string, string | number> = {
				name: name.padEnd(20),
			};

			if (update.inserted !== undefined) payload.inserted = update.inserted;
			if (update.updated !== undefined) payload.updated = update.updated;
			if (update.skipped !== undefined) payload.skipped = update.skipped;
			if (update.errors !== undefined) payload.errors = update.errors;

			progressBar.update(update.processed, payload);
		}
	}

	public completeProgress(name: string): void {
		const progressBar = this.progressBars.get(name);
		if (progressBar) {
			progressBar.update(progressBar.getTotal());
		}
	}

	public removeProgress(name: string): void {
		const progressBar = this.progressBars.get(name);
		if (progressBar && this.multiBar) {
			this.multiBar.remove(progressBar);
			this.progressBars.delete(name);

			if (this.progressBars.size === 0) {
				this.stop();
			}
		}
	}

	public stop(): void {
		if (this.multiBar) {
			this.multiBar.stop();
			this.multiBar = null;
			this.progressBars.clear();
		}
	}

	public updateProgressBarTotal(name: string, newTotal: number): void {
		const progressBar = this.progressBars.get(name);
		if (progressBar) {
			progressBar.setTotal(newTotal);
		}
	}
}
