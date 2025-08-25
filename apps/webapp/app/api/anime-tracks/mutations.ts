"use client";

import { useMutation } from "@tanstack/react-query";
import type {
	CreateAnimeTrackRequest,
	CreateAnimeTrackResponse,
} from "./types";

const base = process.env.NEXT_PUBLIC_HONO_SERVER_URL as string;

export function useCreateAnimeTrack(animeId: number) {
	return useMutation<CreateAnimeTrackResponse, Error, CreateAnimeTrackRequest>({
		mutationKey: ["anime", animeId, "track", "create"],
		mutationFn: async (payload: CreateAnimeTrackRequest) => {
			const res = await fetch(`${base}/api/anime/${animeId}/track`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload ?? {}),
				credentials: "include",
			});

			if (!res.ok) {
				const maybe = (await res
					.json()
					.catch(() => null)) as CreateAnimeTrackResponse | null;
				throw new Error(maybe?.message ?? `Request failed with ${res.status}`);
			}

			return (await res.json()) as CreateAnimeTrackResponse;
		},
	});
}

export function useDeleteAnimeTrack(animeId: number) {
	return useMutation<CreateAnimeTrackResponse, Error, void>({
		mutationKey: ["anime", animeId, "track", "delete"],
		mutationFn: async () => {
			const res = await fetch(`${base}/api/anime/${animeId}/track`, {
				method: "DELETE",
				credentials: "include",
			});

			if (!res.ok) {
				const maybe = (await res
					.json()
					.catch(() => null)) as CreateAnimeTrackResponse | null;
				throw new Error(maybe?.message ?? `Request failed with ${res.status}`);
			}

			return (await res.json()) as CreateAnimeTrackResponse;
		},
	});
}
