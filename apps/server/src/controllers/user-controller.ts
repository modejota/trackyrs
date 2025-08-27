import UserTracksAnimeRepository from "@trackyrs/database/repositories/trackyrs/user-tracks-anime-repository";
import UserTracksMangaRepository from "@trackyrs/database/repositories/trackyrs/user-tracks-manga-repository";
import UserRepository from "@trackyrs/database/repositories/user-repository";
import { Hono } from "hono";
import type { AuthType } from "@/config/auth.config";

const userController = new Hono<{ Bindings: AuthType }>();

userController.get("/:username", async (c) => {
	const username = c.req.param("username");
	if (!username || username.trim().length === 0) {
		return c.json({ success: false, message: "Username is required" }, 400);
	}

	try {
		const user = await UserRepository.findByUsername(username);
		if (!user) {
			return c.json({ success: false, message: "User not found" }, 404);
		}

		const safe = {
			id: user.id,
			username: user.username,
			image: user.image,
			createdAt: user.createdAt,
		};

		return c.json({ success: true, data: safe });
	} catch (error) {
		return c.json({ success: false, message: "Internal Server Error" }, 500);
	}
});

userController.get("/:username/anime-list", async (c) => {
	const username = c.req.param("username");
	if (!username || username.trim().length === 0) {
		return c.json({ success: false, message: "Username is required" }, 400);
	}

	try {
		const user = await UserRepository.findByUsername(username);
		if (!user) {
			return c.json({ success: false, message: "User not found" }, 404);
		}

		const grouped = await UserTracksAnimeRepository.findGroupedByStatusForUser(
			user.id,
		);
		return c.json({ success: true, data: grouped });
	} catch (error) {
		return c.json({ success: false, message: "Internal Server Error" }, 500);
	}
});

userController.get("/:username/manga-list", async (c) => {
	const username = c.req.param("username");
	if (!username || username.trim().length === 0) {
		return c.json({ success: false, message: "Username is required" }, 400);
	}

	try {
		const user = await UserRepository.findByUsername(username);
		if (!user) {
			return c.json({ success: false, message: "User not found" }, 404);
		}

		const grouped = await UserTracksMangaRepository.findGroupedByStatusForUser(
			user.id,
		);
		return c.json({ success: true, data: grouped });
	} catch (error) {
		return c.json({ success: false, message: "Internal Server Error" }, 500);
	}
});

userController.get("/:username/anime-overview", async (c) => {
	const username = c.req.param("username");
	if (!username || username.trim().length === 0) {
		return c.json({ success: false, message: "Username is required" }, 400);
	}

	try {
		const user = await UserRepository.findByUsername(username);
		if (!user) {
			return c.json({ success: false, message: "User not found" }, 404);
		}

		const grouped = await UserTracksAnimeRepository.findGroupedByStatusForUser(
			user.id,
		);
		const all = Object.values(grouped).flat();
		const total = all.length;
		const scores = all
			.map((r: any) => r.score)
			.filter((s: number | null) => typeof s === "number") as number[];
		const averageScore =
			scores.length > 0
				? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2))
				: null;

		const statusCounts = new Map<string, number>();
		for (const [status, list] of Object.entries(grouped)) {
			statusCounts.set(status, list.length);
		}
		const statusPie = Array.from(statusCounts.entries()).map(
			([label, value]) => ({ label, value }),
		);

		const genreCounts = new Map<string, number>();
		for (const r of all) {
			const genres: string[] = (r.genres ?? []) as string[];
			for (const g of genres) {
				if (!g) continue;
				genreCounts.set(g, (genreCounts.get(g) ?? 0) + 1);
			}
		}
		const sortedGenres = Array.from(genreCounts.entries()).sort(
			(a, b) => b[1] - a[1],
		);
		const top = sortedGenres.slice(0, 10);
		const othersValue = sortedGenres
			.slice(10)
			.reduce((acc, [, v]) => acc + v, 0);
		const genresPie = [
			...top.map(([label, value]) => ({ label, value })),
			...(othersValue > 0 ? [{ label: "Others", value: othersValue }] : []),
		];
		const mostWatchedGenre = sortedGenres[0]?.[0] ?? null;

		const seasonOrder = ["Winter", "Spring", "Summer", "Fall"] as const;
		const normalizeSeason = (
			s: string | null | undefined,
		): (typeof seasonOrder)[number] | null => {
			if (!s) return null;
			const u = String(s).toLowerCase();
			if (u.startsWith("win")) return "Winter";
			if (u.startsWith("spr")) return "Spring";
			if (u.startsWith("sum")) return "Summer";
			if (u.startsWith("fal") || u.startsWith("aut")) return "Fall";
			return null;
		};
		const yearSeasonMap = new Map<
			number,
			Record<(typeof seasonOrder)[number], number>
		>();
		for (const r of all) {
			const year: number | null = r.year ?? null;
			const season = normalizeSeason(r.season ?? null);
			if (year == null || season == null) continue;
			if (!yearSeasonMap.has(year)) {
				yearSeasonMap.set(year, { Winter: 0, Spring: 0, Summer: 0, Fall: 0 });
			}
			const obj = yearSeasonMap.get(year)!;
			obj[season] = (obj[season] ?? 0) + 1;
		}
		const yearSeasonBars = Array.from(yearSeasonMap.entries())
			.sort((a, b) => a[0] - b[0])
			.map(([year, counts]) => ({ year, ...counts }));

		let topSeasonYear: { season: string; year: number } | null = null;
		let topSeasonYearCount = 0;
		for (const [year, counts] of yearSeasonMap.entries()) {
			for (const season of seasonOrder) {
				const v = counts[season] ?? 0;
				if (v > topSeasonYearCount) {
					topSeasonYearCount = v;
					topSeasonYear = { season, year };
				}
			}
		}

		const scoreValues = Array.from({ length: 21 }, (_, i) =>
			Number((i / 2).toFixed(1)),
		);
		const scoreMap = new Map<number, number>(scoreValues.map((v) => [v, 0]));
		const detailed: Array<{ zero: number; half: number }> = Array.from(
			{ length: 10 },
			() => ({ zero: 0, half: 0 }),
		);
		for (const s of scores) {
			const clamped = Math.max(0, Math.min(10, s));
			const quantized = Math.round(clamped * 2) / 2;
			scoreMap.set(quantized, (scoreMap.get(quantized) ?? 0) + 1);
			if (quantized === 10) {
				detailed[9]!.half += 1;
				continue;
			}
			const intPart = Math.floor(quantized);
			const frac = quantized - intPart;
			if (frac < 0.5) detailed[intPart]!.zero += 1;
			else detailed[intPart]!.half += 1;
		}
		const scoreHistogram = scoreValues.map((v) => ({
			label: String(v),
			value: scoreMap.get(v) ?? 0,
		}));

		let totalEpisodesWatched = 0;
		let totalSecondsWatched = 0;
		for (const r of all) {
			const eps = (r as any).episodesWatched ?? 0;
			const duration = (r as any).duration ?? 0;
			if (typeof eps === "number") totalEpisodesWatched += eps;
			if (typeof eps === "number" && typeof duration === "number") {
				totalSecondsWatched += eps * duration;
			}
		}
		const episodesWatchedHistogram = [
			{ label: "0-6", value: 0 },
			{ label: "7-12", value: 0 },
			{ label: "13-18", value: 0 },
			{ label: "19-24", value: 0 },
			{ label: "24-32", value: 0 },
			{ label: "32+", value: 0 },
		];
		for (const r of all) {
			const eps = (r as any).episodesWatched ?? 0;
			if (eps < 0) continue;
			if (eps <= 6) episodesWatchedHistogram[0]!.value += 1;
			else if (eps <= 12) episodesWatchedHistogram[1]!.value += 1;
			else if (eps <= 18) episodesWatchedHistogram[2]!.value += 1;
			else if (eps <= 24) episodesWatchedHistogram[3]!.value += 1;
			else if (eps <= 32) episodesWatchedHistogram[4]!.value += 1;
			else episodesWatchedHistogram[5]!.value += 1;
		}

		const top5ByScore = all
			.filter((r: any) => typeof r.score === "number")
			.sort((a: any, b: any) => (b.score ?? 0) - (a.score ?? 0))
			.slice(0, 5)
			.map((r: any) => ({
				id: r.animeId,
				title: r.title,
				images: r.images,
				score: r.score,
			}));

		return c.json({
			success: true,
			data: {
				total,
				averageScore,
				statusPie,
				genresPie,
				yearSeasonBars,
				scoreHistogram,
				scoreHistogramDetailed: detailed,
				mostWatchedGenre,
				topSeasonYear,
				totalEpisodesWatched,
				totalSecondsWatched,
				episodesWatchedHistogram,
				top5ByScore,
			},
		});
	} catch (error) {
		return c.json({ success: false, message: "Internal Server Error" }, 500);
	}
});

userController.get("/:username/manga-overview", async (c) => {
	const username = c.req.param("username");
	if (!username || username.trim().length === 0) {
		return c.json({ success: false, message: "Username is required" }, 400);
	}

	try {
		const user = await UserRepository.findByUsername(username);
		if (!user) {
			return c.json({ success: false, message: "User not found" }, 404);
		}

		const grouped = await UserTracksMangaRepository.findGroupedByStatusForUser(
			user.id,
		);
		const all = Object.values(grouped).flat();
		const total = all.length;
		const scores = all
			.map((r: any) => r.score)
			.filter((s: number | null) => typeof s === "number") as number[];
		const averageScore =
			scores.length > 0
				? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2))
				: null;

		const statusCounts = new Map<string, number>();
		for (const [status, list] of Object.entries(grouped)) {
			statusCounts.set(status, list.length);
		}
		const statusPie = Array.from(statusCounts.entries()).map(
			([label, value]) => ({ label, value }),
		);

		const genreCounts = new Map<string, number>();
		for (const r of all) {
			const genres: string[] = (r.genres ?? []) as string[];
			for (const g of genres) {
				if (!g) continue;
				genreCounts.set(g, (genreCounts.get(g) ?? 0) + 1);
			}
		}
		const sortedGenres = Array.from(genreCounts.entries()).sort(
			(a, b) => b[1] - a[1],
		);
		const top = sortedGenres.slice(0, 6);
		const othersValue = sortedGenres
			.slice(6)
			.reduce((acc, [, v]) => acc + v, 0);
		const genresPie = [
			...top.map(([label, value]) => ({ label, value })),
			...(othersValue > 0 ? [{ label: "Others", value: othersValue }] : []),
		];
		const mostReadGenre = sortedGenres[0]?.[0] ?? null;

		const scoreValues = Array.from({ length: 21 }, (_, i) =>
			Number((i / 2).toFixed(1)),
		);
		const scoreMap = new Map<number, number>(scoreValues.map((v) => [v, 0]));
		for (const s of scores) {
			const clamped = Math.max(0, Math.min(10, s));
			const quantized = Math.round(clamped * 2) / 2;
			scoreMap.set(quantized, (scoreMap.get(quantized) ?? 0) + 1);
		}
		const scoreHistogram = scoreValues.map((v) => ({
			label: String(v),
			value: scoreMap.get(v) ?? 0,
		}));

		const top5ByScore = all
			.filter((r: any) => typeof r.score === "number")
			.sort((a: any, b: any) => (b.score ?? 0) - (a.score ?? 0))
			.slice(0, 5)
			.map((r: any) => ({
				id: r.mangaId,
				title: r.title,
				images: r.images,
				score: r.score,
			}));

		return c.json({
			success: true,
			data: {
				total,
				averageScore,
				statusPie,
				genresPie,
				scoreHistogram,
				mostReadGenre,
				top5ByScore,
			},
		});
	} catch (error) {
		return c.json({ success: false, message: "Internal Server Error" }, 500);
	}
});

export default userController;
