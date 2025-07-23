import { SingleBar } from "cli-progress";

export class FetchUtils {
	static readonly RATE_LIMIT_WAIT_MILLISECONDS = 1100;
	static readonly RATE_LIMIT_EXTRA_WAIT_MILLISECONDS = 5000;

	static async fetchWithRetryAndRateLimit(
		url: string,
		options: RequestInit = {},
	): Promise<Response> {
		const start = Date.now();
		const response = await fetch(url, options);
		const end = Date.now();

		if (response.status === 404) {
			throw new Error("Resource not found");
		}

		if (response.status === 429) {
			const waitTime =
				FetchUtils.RATE_LIMIT_WAIT_MILLISECONDS +
				FetchUtils.RATE_LIMIT_EXTRA_WAIT_MILLISECONDS +
				start -
				end;
			await new Promise((resolve) => setTimeout(resolve, waitTime));
			return FetchUtils.fetchWithRetryAndRateLimit(url, options);
		}

		if (!response.ok) {
			throw new Error(`HTTP error. Status: ${response.status}`);
		}

		const waitTime = FetchUtils.RATE_LIMIT_WAIT_MILLISECONDS + start - end;
		if (waitTime > 0) {
			await new Promise((resolve) => setTimeout(resolve, waitTime));
		}

		return response;
	}

	static createProgressBar(): SingleBar {
		return new SingleBar({
			format: "Progress: |{bar}| {value}/{total} entries",
			barCompleteChar: "\u2588",
			barIncompleteChar: "\u2591",
		});
	}
}
