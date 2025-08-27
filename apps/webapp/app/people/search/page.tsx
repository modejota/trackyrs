import PeopleSearchClient from "@/app/people/search/client";

export default function Page() {
	return (
		<main className="container mx-auto px-4 py-8">
			<div className="mb-4">
				<h1 className="font-bold text-3xl">Search People</h1>
				<p className="text-muted-foreground">Find people by name</p>
			</div>
			<PeopleSearchClient />
		</main>
	);
}
