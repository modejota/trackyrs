import { useQuery } from "@tanstack/react-query";
import type { ProfileMangaLists } from "@/app/api/profile/types";
import type { CreateMangaTrackResponse } from "./types";

const base = process.env.NEXT_PUBLIC_HONO_SERVER_URL as string;

export function useProfileMangaLists(username: string) {
	return useQuery<ProfileMangaLists>({
		queryKey: ["profileMangaLists", username],
		queryFn: async () => {
			const res = await fetch(
				`${base}/api/users/${encodeURIComponent(username)}/manga-list`,
			);
			if (!res.ok) throw new Error(`Failed to fetch manga list: ${res.status}`);
			const json = await res.json();
			if (!json?.success || !json?.data)
				throw new Error("Invalid response shape");
			return json.data as ProfileMangaLists;
		},
		staleTime: 60 * 60 * 1000,
		gcTime: 5 * 60 * 60 * 1000,
	});
}

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
