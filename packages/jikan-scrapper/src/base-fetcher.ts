import type { SingleBar } from "cli-progress";
import { FetcherError, FetcherErrorType } from "@/fetcher-error";
import type { DatabaseOperationResult, JikanResponse } from "@/types";
import { FetchUtils } from "@/utils/fetch-utils";

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
	protected readonly progressBar: SingleBar;
	protected operationProgress: OperationProgress = {
		total: 0,
		processed: 0,
		inserted: 0,
		updated: 0,
		skipped: 0,
		errors: 0,
	};

	public constructor() {
		this.progressBar = FetchUtils.createProgressBar();
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
					throw new FetcherError(
						FetcherErrorType.API_RATE_LIMIT,
						"API rate limit exceeded",
						error,
					);
				}

				if (error.message.includes("HTTP error")) {
					throw new FetcherError(
						FetcherErrorType.NETWORK_ERROR,
						`Network error while fetching ${url}: ${error.message}`,
						error,
					);
				}
			}

			throw new FetcherError(
				FetcherErrorType.NETWORK_ERROR,
				`Unknown error while fetching ${url}`,
				error instanceof Error ? error : new Error(String(error)),
			);
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
					this.operationProgress.total = data.pagination.items.total;
					this.progressBar.start(this.operationProgress.total, 0);
				}

				try {
					const pageResult = await processPage(data);

					totalResult.inserted += pageResult.inserted;
					totalResult.updated += pageResult.updated;
					totalResult.skipped += pageResult.skipped;
					totalResult.errors += pageResult.errors;

					this.operationProgress.processed += data.data.length;
					this.operationProgress.inserted = totalResult.inserted;
					this.operationProgress.updated = totalResult.updated;
					this.operationProgress.skipped = totalResult.skipped;
					this.operationProgress.errors = totalResult.errors;

					this.progressBar.update(this.operationProgress.processed);
				} catch (error) {
					totalResult.errors += data.data.length;
					this.operationProgress.errors = totalResult.errors;

					if (error instanceof FetcherError) {
						throw error;
					}

					throw new FetcherError(
						FetcherErrorType.DATABASE_ERROR,
						`Error processing page ${currentPage}`,
						error instanceof Error ? error : new Error(String(error)),
					);
				}

				hasNextPage = data.pagination?.has_next_page === true && !singlePage;
				currentPage++;
			}

			return totalResult;
		} finally {
			this.progressBar.stop();
		}
	}

	protected async fetchRangeData<T>(
		baseUrl: string,
		processItem: (
			id: number,
			data: T | null,
		) => Promise<DatabaseOperationResult>,
		startId: number,
		endId?: number,
	): Promise<DatabaseOperationResult> {
		const totalResult: DatabaseOperationResult = {
			inserted: 0,
			updated: 0,
			skipped: 0,
			errors: 0,
		};

		this.resetProgress();

		let currentId = startId;
		let consecutiveNotFound = 0;
		const maxConsecutiveNotFound = 50;

		const estimatedTotal = endId ? endId - startId + 1 : 1000;
		this.operationProgress.total = estimatedTotal;
		this.progressBar.start(estimatedTotal, 0);

		try {
			while (true) {
				if (endId && currentId > endId) {
					break;
				}

				try {
					const data = await this.fetchJson<T>(`${baseUrl}/${currentId}`);

					if (data === null) {
						consecutiveNotFound++;
						totalResult.skipped++;

						if (!endId && consecutiveNotFound >= maxConsecutiveNotFound) {
							break;
						}
					} else {
						consecutiveNotFound = 0;

						const itemResult = await processItem(currentId, data);
						totalResult.inserted += itemResult.inserted;
						totalResult.updated += itemResult.updated;
						totalResult.skipped += itemResult.skipped;
						totalResult.errors += itemResult.errors;
					}
				} catch (error) {
					totalResult.errors++;

					if (
						error instanceof FetcherError &&
						error.type === FetcherErrorType.API_RATE_LIMIT
					) {
						throw error;
					}

					console.warn(`Error processing ID ${currentId}:`, error);
				}

				this.operationProgress.processed++;
				this.operationProgress.inserted = totalResult.inserted;
				this.operationProgress.updated = totalResult.updated;
				this.operationProgress.skipped = totalResult.skipped;
				this.operationProgress.errors = totalResult.errors;
				this.progressBar.update(this.operationProgress.processed);
				currentId++;
			}

			return totalResult;
		} finally {
			this.progressBar.stop();
		}
	}

	abstract insertSingle(id: number): Promise<DatabaseOperationResult>;
	abstract insertRange(startId?: number): Promise<DatabaseOperationResult>;
	abstract insertBetween(
		startId: number,
		endId: number,
	): Promise<DatabaseOperationResult>;

	updateSingle?(id: number): Promise<DatabaseOperationResult>;
	updateRange?(startId?: number): Promise<DatabaseOperationResult>;
	updateBetween?(
		startId: number,
		endId: number,
	): Promise<DatabaseOperationResult>;
}
