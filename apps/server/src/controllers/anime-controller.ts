import AnimeGenreRepository from "@trackyrs/database/repositories/myanimelist/anime/anime-genre-repository";
import AnimeRepository from "@trackyrs/database/repositories/myanimelist/anime/anime-repository";
import {
	AnimeStatus,
	AnimeType,
	Season,
} from "@trackyrs/database/types/anime-with-relations";
import { Hono } from "hono";
import type { AuthType } from "@/config/auth.config";

interface SearchCriteria {
	years?: number[];
	seasons?: Season[];
	types?: AnimeType[];
	statuses?: AnimeStatus[];
	genres?: string[];
	title?: string;
}

const animeController = new Hono<{ Bindings: AuthType }>();

animeController.get("/genres", async (c) => {
	try {
		const genres = await AnimeGenreRepository.findDistinctGenres();
		return c.json({ success: true, data: { genres } });
	} catch (error) {
		return c.json({ success: false, message: "Internal Server Error" }, 500);
	}
});

animeController.get("/season", async (c) => {
	const seasonParam = c.req.query("season");
	const yearParam = c.req.query("year");

	if (!seasonParam || seasonParam === "null") {
		return c.json(
			{ success: false, message: "Season parameter is required" },
			400,
		);
	}

	const validSeasons = Object.values(Season);
	if (!validSeasons.includes(seasonParam as Season)) {
		return c.json(
			{
				success: false,
				message: `Invalid season. Must be one of: ${validSeasons.join(", ")}`,
			},
			400,
		);
	}

	if (!yearParam || yearParam === "null") {
		return c.json(
			{ success: false, message: "Year parameter is required" },
			400,
		);
	}
	const parsed = Number.parseInt(yearParam, 10);
	if (Number.isNaN(parsed)) {
		return c.json({ success: false, message: "Invalid year." }, 400);
	}

	const validYearsRaw: Array<number> =
		await AnimeRepository.findDistinctYears();
	const validYears = validYearsRaw.filter(
		(y: number | null): y is number => typeof y === "number",
	);
	if (!validYears.includes(parsed)) {
		return c.json(
			{
				success: false,
				message: `Invalid year. Must be one of: ${validYears.join(", ")}`,
			},
			400,
		);
	}

	const season = seasonParam as Season;
	const year = parsed;

	try {
		const animes = await AnimeRepository.findBySeason(season, year);

		return c.json({
			success: true,
			data: {
				animes,
				season,
				year,
			},
		});
	} catch (error) {
		return c.json({ success: false, message: "Internal Server Error" }, 500);
	}
});

animeController.get("/years", async (c) => {
	try {
		const years = await AnimeRepository.findDistinctYears();
		return c.json({ success: true, data: { years } });
	} catch (error) {
		return c.json({ success: false, message: "Internal Server Error" }, 500);
	}
});

animeController.get("/top", async (c) => {
	const limitParam = c.req.query("limit");
	const pageParam = c.req.query("page");

	const limit = limitParam ? Number.parseInt(limitParam, 10) : 50;
	const page = pageParam ? Number.parseInt(pageParam, 10) : 1;

	if (Number.isNaN(limit) || limit <= 0 || limit > 100) {
		return c.json(
			{
				success: false,
				message: "Invalid limit. Must be a number between 1 and 100",
			},
			400,
		);
	}

	if (Number.isNaN(page) || page <= 0) {
		return c.json(
			{
				success: false,
				message: "Invalid page. Must be a number greater than 0",
			},
			400,
		);
	}

	const offset = (page - 1) * limit;

	try {
		const animes = await AnimeRepository.findTopByReferenceScore(limit, offset);
		return c.json({
			success: true,
			data: {
				animes,
				page,
				limit,
				total: animes.length,
				hasMore: animes.length === limit,
			},
		});
	} catch (error) {
		return c.json({ success: false, message: "Internal Server Error" }, 500);
	}
});

animeController.get("/search", async (c) => {
	const limitParam = c.req.query("limit");
	const pageParam = c.req.query("page");
	const yearsParam = c.req.query("years");
	const seasonsParam = c.req.query("seasons");
	const typesParam = c.req.query("types");
	const statusesParam = c.req.query("statuses");
	const genresParam = c.req.query("genres");
	const titleParam = c.req.query("title");

	const limit = limitParam ? Number.parseInt(limitParam, 10) : 20;
	const page = pageParam ? Number.parseInt(pageParam, 10) : 1;

	if (Number.isNaN(limit) || limit <= 0 || limit > 100) {
		return c.json(
			{
				success: false,
				message: "Invalid limit. Must be a number between 1 and 100",
			},
			400,
		);
	}

	if (Number.isNaN(page) || page <= 0) {
		return c.json(
			{
				success: false,
				message: "Invalid page. Must be a number greater than 0",
			},
			400,
		);
	}

	const criteria: SearchCriteria = {};

	if (yearsParam && yearsParam !== "null") {
		const years = yearsParam
			.split(",")
			.map((y) => y.trim())
			.filter((y) => y.length > 0);
		const parsedYears = years
			.map((y) => Number.parseInt(y, 10))
			.filter((y) => !Number.isNaN(y));
		if (parsedYears.length > 0) {
			criteria.years = parsedYears;
		}
	}

	if (seasonsParam && seasonsParam !== "null") {
		const seasons = seasonsParam
			.split(",")
			.map((s) => s.trim())
			.filter((s) => s.length > 0);
		const validSeasons = seasons.filter((s) =>
			Object.values(Season).includes(s as Season),
		);
		if (validSeasons.length > 0) {
			criteria.seasons = validSeasons as Season[];
		}
	}

	if (typesParam && typesParam !== "null") {
		const types = typesParam
			.split(",")
			.map((t) => t.trim())
			.filter((t) => t.length > 0);
		const validTypes = types.filter((t) =>
			Object.values(AnimeType).includes(t as AnimeType),
		);
		if (validTypes.length > 0) {
			criteria.types = validTypes as AnimeType[];
		}
	}

	if (statusesParam && statusesParam !== "null") {
		const statuses = statusesParam
			.split(",")
			.map((s) => s.trim())
			.filter((s) => s.length > 0);
		const validStatuses = statuses.filter((s) =>
			Object.values(AnimeStatus).includes(s as AnimeStatus),
		);
		if (validStatuses.length > 0) {
			criteria.statuses = validStatuses as AnimeStatus[];
		}
	}

	if (genresParam && genresParam !== "null") {
		const genres = genresParam
			.split(",")
			.map((g) => g.trim())
			.filter((g) => g.length > 0);
		if (genres.length > 0) {
			criteria.genres = genres;
		}
	}

	if (titleParam && titleParam !== "null") {
		criteria.title = titleParam;
	}

	const offset = (page - 1) * limit;

	try {
		const animes = await AnimeRepository.search(criteria, limit, offset);
		return c.json({
			success: true,
			data: {
				animes,
				page,
				limit,
				total: animes.length,
				hasMore: animes.length === limit,
			},
		});
	} catch (error) {
		return c.json({ success: false, message: "Internal Server Error" }, 500);
	}
});

animeController.get("/:id", async (c) => {
	const idParam = c.req.param("id");
	const animeId = Number.parseInt(idParam, 10);

	if (Number.isNaN(animeId)) {
		return c.json({ success: false, message: "Invalid anime ID" }, 400);
	}

	try {
		const anime = await AnimeRepository.findByIdWithRelations(animeId);
		if (!anime) {
			return c.json({ success: false, message: "Anime not found" }, 404);
		}
		return c.json({ success: true, data: anime });
	} catch (error) {
		return c.json({ success: false, message: "Internal Server Error" }, 500);
	}
});

export default animeController;
