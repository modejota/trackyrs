import { useQuery } from "@tanstack/react-query";
import type { CreateMangaTrackResponse } from "./types";

const base = process.env.NEXT_PUBLIC_HONO_SERVER_URL as string;

export function useUserMangaTrack(mangaId: number) {
	return useQuery<CreateMangaTrackResponse>({
		queryKey: ["manga", mangaId, "track"],
		queryFn: async () => {
			const res = await fetch(`${base}/api/manga/${mangaId}/track`, {
				credentials: "include",
			});
			if (!res.ok) throw new Error(`Failed to fetch track: ${res.status}`);
			return (await res.json()) as CreateMangaTrackResponse;
		},
		staleTime: 5 * 60 * 1000,
	});
}
