export enum FetcherErrorType {
	NETWORK_ERROR = "NETWORK_ERROR",
	API_RATE_LIMIT = "API_RATE_LIMIT",
	DATABASE_ERROR = "DATABASE_ERROR",
	VALIDATION_ERROR = "VALIDATION_ERROR",
	UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export class FetcherError extends Error {
	constructor(
		public readonly type: FetcherErrorType,
		message: string,
		public readonly originalError?: Error,
	) {
		super(message);
		this.name = "FetcherError";
	}
}

export function handleError(error: unknown): void {
	if (error instanceof FetcherError) {
		console.error(`❌ ${error.type}: ${error.message}`);
		if (error.originalError) {
			console.error(`   Original error: ${error.originalError.message}`);
		}
	} else if (error instanceof Error) {
		console.error(`❌ Error: ${error.message}`);
	} else {
		console.error(`❌ Unknown error: ${String(error)}`);
	}
	process.exit(1);
}
