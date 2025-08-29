import { useQuery } from "@tanstack/react-query";
import type { UnifiedSearchEnvelope } from "./types";

const base = process.env.NEXT_PUBLIC_HONO_SERVER_URL as string;

export function useUnifiedSearch(query: string, limit = 6) {
	return useQuery({
		queryKey: ["search", "unified", query, limit],
		queryFn: async () => {
			const params = new URLSearchParams();
			params.set("query", query);
			params.set("limit", String(limit));
			const res = await fetch(`${base}/api/search?${params.toString()}`, {
				credentials: "include",
			});
			if (!res.ok) throw new Error(`Failed to search: ${res.status}`);
			const json: UnifiedSearchEnvelope = await res.json();
			if (!json?.success || !json?.data) throw new Error("Invalid response");
			return json.data;
		},
		enabled: Boolean(query && query.trim().length > 0),
		staleTime: 60 * 1000,
	});
}
