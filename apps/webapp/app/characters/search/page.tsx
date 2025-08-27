"use client";

import { CharacterSearchClient } from "./client";

export default function CharacterSearchPage() {
	return (
		<main className="container mx-auto px-4 py-8">
			<div className="mb-4">
				<h1 className="font-bold text-3xl">Search Characters</h1>
				<p className="text-muted-foreground">Find characters by name</p>
			</div>

			<CharacterSearchClient />
		</main>
	);
}
