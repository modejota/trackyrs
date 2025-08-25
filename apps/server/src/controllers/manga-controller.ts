import MangaGenreRepository from "@trackyrs/database/repositories/myanimelist/manga/manga-genre-repository";
import MangaRepository from "@trackyrs/database/repositories/myanimelist/manga/manga-repository";
import UserTracksMangaRepository from "@trackyrs/database/repositories/trackyrs/user-tracks-manga-repository";
import { UserTracksMangaStatus } from "@trackyrs/database/types/manga-tracks";
import {
	MangaStatus,
	MangaType,
} from "@trackyrs/database/types/manga-with-relations";
import { Hono } from "hono";
import { type AuthType, auth } from "@/config/auth.config";
import { protect } from "@/middlewares/auth.middleware";

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
		const session = await auth.api.getSession({ headers: c.req.raw.headers });
		const userId = session?.user?.id;
		const mangas = await MangaRepository.findTopByReferenceScore(
			limit,
			offset,
			userId ?? undefined,
		);
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
		const session = await auth.api.getSession({ headers: c.req.raw.headers });
		const userId = session?.user?.id;
		const mangas = await MangaRepository.findOngoing(
			limit,
			offset,
			userId ?? undefined,
		);
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
		const session = await auth.api.getSession({ headers: c.req.raw.headers });
		const userId = session?.user?.id;
		const mangas = await MangaRepository.search(
			criteria,
			limit,
			offset,
			userId ?? undefined,
		);
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

mangaController.post("/:id/track", protect, async (c) => {
	const idParam = c.req.param("id");
	const mangaId = Number.parseInt(idParam, 10);
	if (Number.isNaN(mangaId)) {
		return c.json({ success: false, message: "Invalid manga ID" }, 400);
	}

	const manga = await MangaRepository.findById(mangaId);
	if (!manga) {
		return c.json({ success: false, message: "Manga not found" }, 404);
	}

	const body = await c.req.json().catch(() => ({}) as Record<string, unknown>);
	const statusRaw = (body?.status ?? undefined) as string | undefined;
	const scoreRaw = body?.score as number | undefined;
	const chaptersReadRaw = body?.chaptersRead as number | undefined;
	const startDateRaw = body?.startDate as string | undefined;
	const endDateRaw = body?.endDate as string | undefined;
	const rereadsRaw = body?.rereads as number | undefined;

	let status: UserTracksMangaStatus | undefined;
	if (statusRaw !== undefined) {
		const validStatuses = Object.values(UserTracksMangaStatus);
		if (!validStatuses.includes(statusRaw as UserTracksMangaStatus)) {
			return c.json(
				{
					success: false,
					message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
				},
				400,
			);
		}
		status = statusRaw as UserTracksMangaStatus;
	}

	let score: number | undefined;
	if (scoreRaw !== undefined) {
		if (Number.isNaN(scoreRaw) || scoreRaw < 0 || scoreRaw > 10) {
			return c.json(
				{
					success: false,
					message: "Invalid score. Must be a number between 0 and 10",
				},
				400,
			);
		}
		score = Math.round(scoreRaw * 10000) / 10000;
	}

	if (chaptersReadRaw !== undefined) {
		if (Number.isNaN(chaptersReadRaw) || chaptersReadRaw < 0) {
			return c.json(
				{
					success: false,
					message: "Invalid chapters read. Must be a non-negative number",
				},
				400,
			);
		}
	}

	if (startDateRaw !== undefined) {
		if (Number.isNaN(Date.parse(startDateRaw))) {
			return c.json(
				{
					success: false,
					message: "Invalid startDate. Must be an ISO timestamp string",
				},
				400,
			);
		}
	}

	if (endDateRaw !== undefined) {
		if (Number.isNaN(Date.parse(endDateRaw))) {
			return c.json(
				{
					success: false,
					message: "Invalid endDate. Must be an ISO timestamp string",
				},
				400,
			);
		}
	}

	let rereads: number | undefined;
	if (rereadsRaw !== undefined) {
		if (Number.isNaN(rereadsRaw) || rereadsRaw < 0) {
			return c.json(
				{
					success: false,
					message: "Invalid rereads. Must be a non-negative integer",
				},
				400,
			);
		}
		rereads = Math.floor(rereadsRaw);
	}

	const user = c.get("user" as never) as { id: string } | undefined;
	if (!user?.id) {
		return c.json({ success: false, message: "Unauthorized" }, 401);
	}

	const existing = await UserTracksMangaRepository.findByUserIdAndMangaId(
		user.id,
		mangaId,
	);

	try {
		if (existing) {
			const updated = await UserTracksMangaRepository.updateByUserIdAndMangaId(
				user.id,
				mangaId,
				{
					...(status !== undefined ? { status } : {}),
					...(score !== undefined ? { score } : {}),
					...(chaptersReadRaw !== undefined
						? { chaptersRead: chaptersReadRaw }
						: {}),
					...(startDateRaw !== undefined ? { startDate: startDateRaw } : {}),
					...(endDateRaw !== undefined ? { endDate: endDateRaw } : {}),
					...(rereads !== undefined ? { rereads } : {}),
				},
			);
			return c.json({ success: true, data: { track: updated } });
		}

		const track = await UserTracksMangaRepository.insert({
			mangaId,
			userId: user.id,
			status,
			score,
			chaptersRead: chaptersReadRaw,
			startDate: startDateRaw,
			endDate: endDateRaw,
			rereads,
		});

		return c.json({ success: true, data: { track } }, 201);
	} catch (error) {
		return c.json(
			{
				success: false,
				message: existing ? "Failed to update track" : "Failed to create track",
			},
			500,
		);
	}
});

mangaController.get("/:id/track", protect, async (c) => {
	const idParam = c.req.param("id");
	const mangaId = Number.parseInt(idParam, 10);
	if (Number.isNaN(mangaId)) {
		return c.json({ success: false, message: "Invalid manga ID" }, 400);
	}

	const user = c.get("user" as never) as { id: string } | undefined;
	if (!user?.id) {
		return c.json({ success: false, message: "Unauthorized" }, 401);
	}

	try {
		const track = await UserTracksMangaRepository.findByUserIdAndMangaId(
			user.id,
			mangaId,
		);
		return c.json({ success: true, data: { track: track ?? null } });
	} catch (error) {
		return c.json({ success: false, message: "Internal Server Error" }, 500);
	}
});

mangaController.delete("/:id/track", protect, async (c) => {
	const idParam = c.req.param("id");
	const mangaId = Number.parseInt(idParam, 10);
	if (Number.isNaN(mangaId)) {
		return c.json({ success: false, message: "Invalid manga ID" }, 400);
	}

	const user = c.get("user" as never) as { id: string } | undefined;
	if (!user?.id) {
		return c.json({ success: false, message: "Unauthorized" }, 401);
	}

	try {
		const deleted = await UserTracksMangaRepository.deleteByUserIdAndMangaId(
			user.id,
			mangaId,
		);
		if (!deleted) {
			return c.json({ success: false, message: "Track not found" }, 404);
		}
		return c.json({ success: true, data: { track: deleted } });
	} catch (error) {
		return c.json({ success: false, message: "Failed to delete track" }, 500);
	}
});

export default mangaController;
