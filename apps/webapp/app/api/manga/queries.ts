import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { Manga } from "@trackyrs/database/schemas/myanimelist/manga/manga-schema";
import type { MangaWithRelations } from "@trackyrs/database/types/manga-with-relations";
import type {
	MangaOngoingApiEnvelope,
	MangaSearchCriteria,
	MangaSearchResponse,
	MangaTopApiEnvelope,
} from "@/app/api/manga/types";

const base = process.env.NEXT_PUBLIC_HONO_SERVER_URL as string;

export function useMangaDetails(mangaId: number) {
	return useQuery<MangaWithRelations>({
		queryKey: ["manga", mangaId],
		queryFn: async () => {
			const res = await fetch(`${base}/api/manga/${mangaId}`);
			if (!res.ok) throw new Error(`Failed to fetch manga: ${res.status}`);
			const json = await res.json();
			if (!json?.success || !json?.data)
				throw new Error("Invalid response shape");
			return json.data as MangaWithRelations;
		},
		staleTime: 60 * 60 * 1000, // 1 hour
		gcTime: 5 * 60 * 60 * 1000, // 5 hours
	});
}

export function useTopManga(limit = 30, page = 1) {
	return useQuery<{
		mangas: Manga[];
		page: number;
		limit: number;
		total: number;
		hasMore: boolean;
	}>({
		queryKey: ["manga", "top", "landing", limit, page],
		queryFn: async () => {
			const url = `${base}/api/manga/top?limit=${limit}&page=${page}`;
			const res = await fetch(url);
			if (!res.ok) throw new Error(`Failed to fetch top manga: ${res.status}`);
			const json: MangaTopApiEnvelope = await res.json();
			if (!json?.success || !json?.data)
				throw new Error("Invalid response shape");
			return json.data;
		},
		staleTime: 60 * 60 * 1000, // 1 hour
		gcTime: 5 * 60 * 60 * 1000, // 5 hours
	});
}

export function useOngoingManga(limit = 30, page = 1) {
	return useQuery<{
		mangas: Manga[];
		page: number;
		limit: number;
		total: number;
		hasMore: boolean;
	}>({
		queryKey: ["manga", "ongoing", "landing", limit, page],
		queryFn: async () => {
			const url = `${base}/api/manga/ongoing?limit=${limit}&page=${page}`;
			const res = await fetch(url);
			if (!res.ok)
				throw new Error(`Failed to fetch ongoing manga: ${res.status}`);
			const json: MangaOngoingApiEnvelope = await res.json();
			if (!json?.success || !json?.data)
				throw new Error("Invalid response shape");
			return json.data;
		},
		staleTime: 60 * 60 * 1000, // 1 hour
		gcTime: 5 * 60 * 60 * 1000, // 5 hours
	});
}

export function useInfiniteTopManga(limit = 50) {
	return useInfiniteQuery({
		queryKey: ["manga-top", limit],
		queryFn: async ({ pageParam = 1 }) => {
			const params = new URLSearchParams();
			params.append("page", String(pageParam ?? 1));
			params.append("limit", String(limit));
			const res = await fetch(`${base}/api/manga/top?${params.toString()}`);
			if (!res.ok) throw new Error(`Failed to fetch top manga: ${res.status}`);
			const json: MangaTopApiEnvelope = await res.json();
			if (!json?.success || !json?.data)
				throw new Error("Invalid response shape");
			return json.data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage) =>
			lastPage.hasMore ? lastPage.page + 1 : undefined,
	});
}

export function useInfiniteOngoingManga(limit = 50) {
	return useInfiniteQuery({
		queryKey: ["manga-ongoing", limit],
		queryFn: async ({ pageParam = 1 }) => {
			const params = new URLSearchParams();
			params.append("page", String(pageParam ?? 1));
			params.append("limit", String(limit));
			const res = await fetch(`${base}/api/manga/ongoing?${params.toString()}`);
			if (!res.ok)
				throw new Error(`Failed to fetch ongoing manga: ${res.status}`);
			const json: MangaOngoingApiEnvelope = await res.json();
			if (!json?.success || !json?.data)
				throw new Error("Invalid response shape");
			return json.data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage) =>
			lastPage.hasMore ? lastPage.page + 1 : undefined,
	});
}

export function useInfiniteMangaSearch(
	criteria: MangaSearchCriteria,
	limit = 20,
) {
	return useInfiniteQuery({
		queryKey: ["manga-search", criteria, limit],
		queryFn: async ({ pageParam = 1 }) => {
			const params = new URLSearchParams();
			params.append("page", String(pageParam ?? 1));
			params.append("limit", String(limit));

			if (criteria.title) params.append("title", criteria.title);
			if (criteria.genres?.length)
				params.append("genres", criteria.genres.join(","));
			if (criteria.years?.length)
				params.append("years", criteria.years.join(","));
			if (criteria.types?.length)
				params.append("types", criteria.types.join(","));
			if (criteria.statuses?.length)
				params.append("statuses", criteria.statuses.join(","));

			const res = await fetch(`${base}/api/manga/search?${params.toString()}`);
			if (!res.ok)
				throw new Error(`Failed to fetch search results: ${res.status}`);
			const json = await res.json();
			if (!json?.success || !json?.data)
				throw new Error("Invalid response shape");
			return json.data as MangaSearchResponse["data"];
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage) =>
			lastPage.hasMore ? lastPage.page + 1 : undefined,
		enabled: Object.values(criteria).some(
			(val) =>
				val !== undefined &&
				val !== "" &&
				(Array.isArray(val) ? val.length > 0 : true),
		),
	});
}
