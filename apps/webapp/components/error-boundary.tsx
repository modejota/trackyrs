"use client";

import { Button } from "@trackyrs/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@trackyrs/ui/components/card";
import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error?: Error;
}

export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error("Error boundary caught an error:", error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<Card className="border-destructive">
					<CardHeader>
						<CardTitle className="text-destructive">
							Something went wrong
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-muted-foreground">
							An error occurred while loading this content. Please try
							refreshing the page.
						</p>
						{this.state.error && (
							<details className="text-sm">
								<summary className="cursor-pointer text-muted-foreground hover:text-foreground">
									Error details
								</summary>
								<pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs">
									{this.state.error.message}
								</pre>
							</details>
						)}
						<Button
							onClick={() => window.location.reload()}
							variant="outline"
							size="sm"
						>
							Refresh Page
						</Button>
					</CardContent>
				</Card>
			);
		}

		return this.props.children;
	}
}
