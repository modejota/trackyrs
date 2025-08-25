"use client";

import { useMutation } from "@tanstack/react-query";
import type {
	CreateMangaTrackRequest,
	CreateMangaTrackResponse,
} from "./types";

const base = process.env.NEXT_PUBLIC_HONO_SERVER_URL as string;

export function useCreateMangaTrack(mangaId: number) {
	return useMutation<CreateMangaTrackResponse, Error, CreateMangaTrackRequest>({
		mutationKey: ["manga", mangaId, "track", "create"],
		mutationFn: async (payload: CreateMangaTrackRequest) => {
			const res = await fetch(`${base}/api/manga/${mangaId}/track`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload ?? {}),
				credentials: "include",
			});

			if (!res.ok) {
				const maybe = (await res
					.json()
					.catch(() => null)) as CreateMangaTrackResponse | null;
				throw new Error(maybe?.message ?? `Request failed with ${res.status}`);
			}

			return (await res.json()) as CreateMangaTrackResponse;
		},
	});
}

export function useDeleteMangaTrack(mangaId: number) {
	return useMutation<CreateMangaTrackResponse, Error, void>({
		mutationKey: ["manga", mangaId, "track", "delete"],
		mutationFn: async () => {
			const res = await fetch(`${base}/api/manga/${mangaId}/track`, {
				method: "DELETE",
				credentials: "include",
			});

			if (!res.ok) {
				const maybe = (await res
					.json()
					.catch(() => null)) as CreateMangaTrackResponse | null;
				throw new Error(maybe?.message ?? `Request failed with ${res.status}`);
			}

			return (await res.json()) as CreateMangaTrackResponse;
		},
	});
}
