"use client";

import { useQuery } from "@tanstack/react-query";
import type { CreateAnimeTrackResponse } from "./types";

const base = process.env.NEXT_PUBLIC_HONO_SERVER_URL as string;

export function useUserAnimeTrack(animeId: number) {
	return useQuery<CreateAnimeTrackResponse>({
		queryKey: ["anime", animeId, "track"],
		queryFn: async () => {
			const res = await fetch(`${base}/api/anime/${animeId}/track`, {
				credentials: "include",
			});
			if (!res.ok) throw new Error(`Failed to fetch track: ${res.status}`);
			return (await res.json()) as CreateAnimeTrackResponse;
		},
		staleTime: 5 * 60 * 1000,
	});
}
