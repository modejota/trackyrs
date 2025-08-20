import MangaGenreRepository from "@trackyrs/database/repositories/myanimelist/manga/manga-genre-repository";
import MangaRepository from "@trackyrs/database/repositories/myanimelist/manga/manga-repository";
import {
	MangaStatus,
	MangaType,
} from "@trackyrs/database/types/manga-with-relations";
import { Hono } from "hono";
import type { AuthType } from "@/config/auth.config";

const mangaController = new Hono<{ Bindings: AuthType }>();

mangaController.get("/genres", async (c) => {
	try {
		const genres = await MangaGenreRepository.findDistinctGenres();
		return c.json({ success: true, data: { genres } });
	} catch (error) {
		return c.json({ success: false, message: "Internal Server Error" }, 500);
	}
});

mangaController.get("/years", async (c) => {
	try {
		const years = await MangaRepository.findDistinctYears();
		return c.json({ success: true, data: { years } });
	} catch (error) {
		return c.json({ success: false, message: "Internal Server Error" }, 500);
	}
});

mangaController.get("/top", async (c) => {
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
		const mangas = await MangaRepository.findTopByReferenceScore(limit, offset);
		return c.json({
			success: true,
			data: {
				mangas,
				page,
				limit,
				total: mangas.length,
				hasMore: mangas.length === limit,
			},
		});
	} catch (error) {
		return c.json({ success: false, message: "Internal Server Error" }, 500);
	}
});

mangaController.get("/ongoing", async (c) => {
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
		const mangas = await MangaRepository.findOngoing(limit, offset);
		return c.json({
			success: true,
			data: {
				mangas,
				page,
				limit,
				total: mangas.length,
				hasMore: mangas.length === limit,
			},
		});
	} catch (error) {
		return c.json({ success: false, message: "Internal Server Error" }, 500);
	}
});

mangaController.get("/search", async (c) => {
	const limitParam = c.req.query("limit");
	const pageParam = c.req.query("page");
	const yearsParam = c.req.query("years");
	const statusesParam = c.req.query("statuses");
	const typesParam = c.req.query("types");
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

	const criteria: any = {};

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

	if (statusesParam && statusesParam !== "null") {
		const statuses = statusesParam
			.split(",")
			.map((s) => s.trim())
			.filter((s) => s.length > 0);
		const validStatuses = statuses.filter((s) =>
			Object.values(MangaStatus).includes(s as MangaStatus),
		);
		if (validStatuses.length > 0) {
			criteria.statuses = validStatuses;
		}
	}

	if (typesParam && typesParam !== "null") {
		const types = typesParam
			.split(",")
			.map((t) => t.trim())
			.filter((t) => t.length > 0);
		const validTypes = types.filter((t) =>
			Object.values(MangaType).includes(t as MangaType),
		);
		if (validTypes.length > 0) {
			criteria.types = validTypes;
		}
	}

	if (genresParam && genresParam !== "null") {
		criteria.genres = genresParam
			.split(",")
			.map((g) => g.trim())
			.filter((g) => g.length > 0);
	}

	if (titleParam && titleParam !== "null") {
		criteria.title = titleParam;
	}

	const offset = (page - 1) * limit;

	try {
		const mangas = await MangaRepository.search(criteria, limit, offset);
		return c.json({
			success: true,
			data: {
				mangas,
				page,
				limit,
				total: mangas.length,
				hasMore: mangas.length === limit,
			},
		});
	} catch (error) {
		return c.json({ success: false, message: "Internal Server Error" }, 500);
	}
});

mangaController.get("/:id", async (c) => {
	const idParam = c.req.param("id");
	const mangaId = Number.parseInt(idParam, 10);

	if (Number.isNaN(mangaId)) {
		return c.json({ success: false, message: "Invalid manga ID" }, 400);
	}

	try {
		const manga = await MangaRepository.findByIdWithRelations(mangaId);

		if (!manga) {
			return c.json({ success: false, message: "Manga not found" }, 404);
		}
		return c.json({ success: true, data: manga });
	} catch (error) {
		console.log(error);
		return c.json({ success: false, message: "Internal Server Error" }, 500);
	}
});

export default mangaController;
