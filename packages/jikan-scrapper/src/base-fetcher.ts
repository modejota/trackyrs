import type { DatabaseOperationResult, JikanResponse } from "@/types";
import { FetchUtils } from "@/utils/fetch-utils";
import { ProgressManager } from "@/utils/progress-manager";

export interface OperationProgress {
	total: number;
	processed: number;
	inserted: number;
	updated: number;
	skipped: number;
	errors: number;
}

export abstract class BaseFetcher {
	protected static readonly ITEMS_PER_PAGE = 25;
	protected readonly baseUrl: string = "https://api.jikan.moe/v4";
	protected readonly progressManager: ProgressManager;
	protected progressBarName: string | null = null;
	private isChildProgress = false;
	protected operationProgress: OperationProgress = {
		total: 0,
		processed: 0,
		inserted: 0,
		updated: 0,
		skipped: 0,
		errors: 0,
	};

	public constructor(progressBarName?: string) {
		this.progressManager = ProgressManager.getInstance();
		if (progressBarName) {
			this.progressBarName = progressBarName;
			this.isChildProgress = true;
		}
	}

	protected resetProgress(): void {
		this.operationProgress = {
			total: 0,
			processed: 0,
			inserted: 0,
			updated: 0,
			skipped: 0,
			errors: 0,
		};
	}

	protected startProgress(total: number, name?: string): void {
		this.operationProgress.total = total;

		if (this.progressBarName) {
			this.progressManager.updateProgressBarTotal(this.progressBarName, total);
			return;
		}

		const progressName = name || this.constructor.name.replace("Fetcher", "");
		this.progressBarName = this.progressManager.createProgressBar({
			name: progressName,
			total,
		});
	}

	protected updateProgress(processed: number): void {
		this.operationProgress.processed = processed;

		if (this.progressBarName) {
			this.progressManager.updateProgress(this.progressBarName, {
				processed,
				inserted: this.operationProgress.inserted,
				updated: this.operationProgress.updated,
				skipped: this.operationProgress.skipped,
				errors: this.operationProgress.errors,
			});
		}
	}

	protected stopProgress(): void {
		if (this.progressBarName && !this.isChildProgress) {
			this.progressManager.completeProgress(this.progressBarName);
			this.progressManager.removeProgress(this.progressBarName);
			this.progressBarName = null;
		} else if (this.progressBarName && this.isChildProgress) {
			this.progressManager.completeProgress(this.progressBarName);
		}
	}

	protected createChildProgress(name: string, total: number): string {
		return this.progressManager.createProgressBar({
			name: `  └─ ${name}`,
			total,
		});
	}
	protected removeChildProgress(name: string): void {
		this.progressManager.completeProgress(name);
		this.progressManager.removeProgress(name);
	}

	protected async fetchJson<T>(url: string): Promise<T | null> {
		try {
			const response = await FetchUtils.fetchWithRetryAndRateLimit(url);
			return await response.json();
		} catch (error: unknown) {
			if (error instanceof Error) {
				if (error.message === "Resource not found") {
					return null;
				}

				if (error.message.includes("HTTP error. Status: 429")) {
					console.error(
						`❌ API_RATE_LIMIT: API rate limit exceeded while fetching ${url}`,
						{
							url,
							error: error.message,
							stack: error.stack,
						},
					);
					return null;
				}

				if (error.message.includes("HTTP error")) {
					console.error(
						`❌ NETWORK_ERROR: Network error while fetching ${url}`,
						{
							url,
							error: error.message,
							stack: error.stack,
						},
					);
					return null;
				}
			}

			console.error(`❌ NETWORK_ERROR: Unknown error while fetching ${url}`, {
				url,
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
			});
			return null;
		}
	}

	protected async fetchPaginatedData<T>(
		baseUrl: string,
		processPage: (data: JikanResponse<T[]>) => Promise<DatabaseOperationResult>,
		startPage?: number,
		singlePage?: boolean,
	): Promise<DatabaseOperationResult> {
		let currentPage = startPage ?? 1;
		let hasNextPage = true;
		const totalResult: DatabaseOperationResult = {
			inserted: 0,
			updated: 0,
			skipped: 0,
			errors: 0,
			ids: [],
		};

		this.resetProgress();

		try {
			while (hasNextPage) {
				const data = await this.fetchJson<JikanResponse<T[]>>(
					`${baseUrl}?page=${currentPage}&orderBy=mal_id`,
				);

				if (!data || !data.data) {
					hasNextPage = false;
					continue;
				}

				if (currentPage === 1 && data.pagination) {
					this.startProgress(data.pagination.items.total);
				}

				try {
					const pageResult = await processPage(data);

					totalResult.inserted += pageResult.inserted;
					totalResult.updated += pageResult.updated;
					totalResult.skipped += pageResult.skipped;
					totalResult.errors += pageResult.errors;
					totalResult.ids.push(...pageResult.ids);

					this.operationProgress.processed += data.data.length;
					this.operationProgress.inserted = totalResult.inserted;
					this.operationProgress.updated = totalResult.updated;
					this.operationProgress.skipped = totalResult.skipped;
					this.operationProgress.errors = totalResult.errors;

					this.updateProgress(this.operationProgress.processed);
				} catch (error) {
					totalResult.errors += data.data.length;
					this.operationProgress.errors = totalResult.errors;

					console.error(
						`Error processing page ${currentPage} (${data.data.length} entities):`,
						{
							page: currentPage,
							entityCount: data.data.length,
							error: error instanceof Error ? error.message : String(error),
							stack: error instanceof Error ? error.stack : undefined,
						},
					);

					this.operationProgress.processed += data.data.length;
					this.updateProgress(this.operationProgress.processed);
				}

				hasNextPage = data.pagination?.has_next_page === true && !singlePage;
				currentPage++;
			}

			return totalResult;
		} finally {
			this.stopProgress();
		}
	}

	abstract upsertSingle(id: number): Promise<DatabaseOperationResult>;
	abstract upsertRange(startId?: number): Promise<DatabaseOperationResult>;
	abstract upsertFromList(ids: number[]): Promise<DatabaseOperationResult>;
}
