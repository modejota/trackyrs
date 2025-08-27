import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { PeopleSearchEnvelope, PeopleWithRelations } from "./types";

const base = process.env.NEXT_PUBLIC_HONO_SERVER_URL as string;

export function usePeopleDetails(peopleId: number) {
	return useQuery<PeopleWithRelations>({
		queryKey: ["people", peopleId],
		queryFn: async () => {
			const res = await fetch(`${base}/api/people/${peopleId}`, {
				credentials: "include",
			});
			if (!res.ok) throw new Error(`Failed to fetch people: ${res.status}`);
			const json = await res.json();
			if (!json?.success || !json?.data)
				throw new Error("Invalid response shape");
			return json.data as PeopleWithRelations;
		},
		staleTime: 60 * 60 * 1000,
		gcTime: 5 * 60 * 60 * 1000,
	});
}

export function useInfinitePeopleSearch(name: string, limit = 24) {
	return useInfiniteQuery({
		queryKey: ["people", "search", name, limit],
		queryFn: async ({ pageParam = 1 }) => {
			const params = new URLSearchParams();
			params.append("page", String(pageParam ?? 1));
			params.append("limit", String(limit));
			if (name) params.append("name", name);
			const res = await fetch(
				`${base}/api/people/search?${params.toString()}`,
				{
					credentials: "include",
				},
			);
			if (!res.ok) throw new Error(`Failed to search people: ${res.status}`);
			const json: PeopleSearchEnvelope = await res.json();
			if (!json?.success || !json?.data)
				throw new Error("Invalid response shape");
			return json.data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage) =>
			lastPage.hasMore ? lastPage.page + 1 : undefined,
		enabled: Boolean(name && name.trim().length > 0),
	});
}
