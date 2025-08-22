import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { Anime } from "@trackyrs/database/schemas/myanimelist/anime/anime-schema";
import type {
	AnimeWithRelations,
	Season,
} from "@trackyrs/database/types/anime-with-relations";
import type {
	AnimeSearchCriteria,
	AnimeSearchResponse,
	AnimeSeasonApiEnvelope,
	AnimeTopApiEnvelope,
	AvailableAnimeYearsApiEnvelope,
} from "@/app/api/anime/types";

const base = process.env.NEXT_PUBLIC_HONO_SERVER_URL as string;

export function useAnimeDetails(animeId: number) {
	return useQuery<AnimeWithRelations>({
		queryKey: ["anime", animeId],
		queryFn: async () => {
			const res = await fetch(`${base}/api/anime/${animeId}`);
			if (!res.ok) throw new Error(`Failed to fetch anime: ${res.status}`);
			const json = await res.json();
			if (!json?.success || !json?.data)
				throw new Error("Invalid response shape");
			return json.data as AnimeWithRelations;
		},
		staleTime: 60 * 60 * 1000, // 1 hour
		gcTime: 5 * 60 * 60 * 1000, // 5 hours
	});
}

export function useTopAnime(limit = 30, page = 1) {
	return useQuery<{
		animes: Anime[];
		page: number;
		limit: number;
		total: number;
		hasMore: boolean;
	}>({
		queryKey: ["anime", "top", "landing", limit, page],
		queryFn: async () => {
			const url = `${base}/api/anime/top?limit=${limit}&page=${page}`;
			const res = await fetch(url);
			if (!res.ok) throw new Error(`Failed to fetch top anime: ${res.status}`);
			const json: AnimeTopApiEnvelope = await res.json();
			if (!json?.success || !json?.data)
				throw new Error("Invalid response shape");
			return json.data;
		},
		staleTime: 60 * 60 * 1000, // 1 hour
		gcTime: 5 * 60 * 60 * 1000, // 5 hours
	});
}

export function useSeasonalAnime(season: Season, year: number) {
	return useQuery<{ animes: Anime[]; season: Season; year: number }>({
		queryKey: ["anime", "season", season, year],
		queryFn: async () => {
			const url = `${base}/api/anime/season?season=${encodeURIComponent(
				season,
			)}&year=${encodeURIComponent(String(year))}`;
			const res = await fetch(url);
			if (!res.ok) throw new Error(`Failed to fetch season: ${res.status}`);
			const json: AnimeSeasonApiEnvelope = await res.json();
			if (!json?.success || !json?.data)
				throw new Error("Invalid response shape");
			return json.data;
		},
		staleTime: 60 * 60 * 1000, // 1 hour
		gcTime: 5 * 60 * 60 * 1000, // 5 hours
	});
}

export function useAvailableYears() {
	return useQuery<number[]>({
		queryKey: ["anime", "years"],
		queryFn: async () => {
			const base = process.env.NEXT_PUBLIC_HONO_SERVER_URL as string;
			const res = await fetch(`${base}/api/anime/years`);
			if (!res.ok) throw new Error(`Failed to fetch years: ${res.status}`);
			const json: AvailableAnimeYearsApiEnvelope = await res.json();
			if (!json?.success || !json?.data)
				throw new Error("Invalid response shape");
			return json.data.years;
		},
		staleTime: 60 * 60 * 1000, // 1 hour
		gcTime: 5 * 60 * 60 * 1000, // 5 hours
	});
}

export function useInfiniteTopAnime(limit = 50) {
	return useInfiniteQuery({
		queryKey: ["anime-top", limit],
		queryFn: async ({ pageParam = 1 }) => {
			const params = new URLSearchParams();
			params.append("page", String(pageParam ?? 1));
			params.append("limit", String(limit));
			const res = await fetch(`${base}/api/anime/top?${params.toString()}`);
			if (!res.ok) throw new Error(`Failed to fetch top anime: ${res.status}`);
			const json: AnimeTopApiEnvelope = await res.json();
			if (!json?.success || !json?.data)
				throw new Error("Invalid response shape");
			return json.data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage) =>
			lastPage.hasMore ? lastPage.page + 1 : undefined,
	});
}

export function useInfiniteAnimeSearch(
	criteria: AnimeSearchCriteria,
	limit = 24,
) {
	return useInfiniteQuery({
		queryKey: ["anime-search", criteria, limit],
		queryFn: async ({ pageParam = 1 }) => {
			const params = new URLSearchParams();
			params.append("page", String(pageParam ?? 1));
			params.append("limit", String(limit));

			if (criteria.title) params.append("title", criteria.title);
			if (criteria.genres?.length)
				params.append("genres", criteria.genres.join(","));
			if (criteria.years?.length)
				params.append("years", criteria.years.join(","));
			if (criteria.seasons?.length)
				params.append("seasons", criteria.seasons.join(","));
			if (criteria.types?.length)
				params.append("types", criteria.types.join(","));
			if (criteria.statuses?.length)
				params.append("statuses", criteria.statuses.join(","));

			const res = await fetch(`${base}/api/anime/search?${params.toString()}`);
			if (!res.ok)
				throw new Error(`Failed to fetch search results: ${res.status}`);
			const json = await res.json();
			if (!json?.success || !json?.data)
				throw new Error("Invalid response shape");
			return json.data as AnimeSearchResponse["data"];
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
