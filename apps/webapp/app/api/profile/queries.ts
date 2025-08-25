import { useQuery } from "@tanstack/react-query";
import type { ProfileAnimeLists, ProfileMangaLists, PublicUser } from "./types";

const base = process.env.NEXT_PUBLIC_HONO_SERVER_URL as string;

export function useUserByUsername(username: string) {
	return useQuery<PublicUser>({
		queryKey: ["user", username],
		queryFn: async () => {
			const res = await fetch(
				`${base}/api/users/${encodeURIComponent(username)}`,
			);
			if (!res.ok) throw new Error(`Failed to fetch user: ${res.status}`);
			const json = await res.json();
			if (!json?.success || !json?.data)
				throw new Error("Invalid response shape");
			return json.data as PublicUser;
		},
		staleTime: 60 * 60 * 1000, // 1 hour
		gcTime: 5 * 60 * 60 * 1000, // 5 hours
	});
}

export function useProfileAnimeLists(username: string) {
	return useQuery<ProfileAnimeLists>({
		queryKey: ["profileAnimeLists", username],
		queryFn: async () => {
			const res = await fetch(
				`${base}/api/users/${encodeURIComponent(username)}/anime-list`,
			);
			if (!res.ok) throw new Error(`Failed to fetch anime list: ${res.status}`);
			const json = await res.json();
			if (!json?.success || !json?.data)
				throw new Error("Invalid response shape");
			return json.data as ProfileAnimeLists;
		},
		staleTime: 60 * 60 * 1000, // 1 hour
		gcTime: 5 * 60 * 60 * 1000, // 5 hours
	});
}

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
		staleTime: 60 * 60 * 1000, // 1 hour
		gcTime: 5 * 60 * 60 * 1000, // 5 hours
	});
}
