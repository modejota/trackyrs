import { useQuery } from "@tanstack/react-query";
import type { CharacterWithRelations } from "./types";

const base = process.env.NEXT_PUBLIC_HONO_SERVER_URL as string;

export function useCharacterDetails(characterId: number) {
	return useQuery<CharacterWithRelations>({
		queryKey: ["character", characterId],
		queryFn: async () => {
			const res = await fetch(`${base}/api/characters/${characterId}`, {
				credentials: "include",
			});
			if (!res.ok) throw new Error(`Failed to fetch character: ${res.status}`);
			const json = await res.json();
			if (!json?.success || !json?.data)
				throw new Error("Invalid response shape");
			return json.data as CharacterWithRelations;
		},
		staleTime: 60 * 60 * 1000, // 1 hour
		gcTime: 5 * 60 * 60 * 1000, // 5 hours
	});
}
