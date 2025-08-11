import AnimeRepository from "@trackyrs/database/repositories/myanimelist/anime/anime-repository";
import { Hono } from "hono";
import type { AuthType } from "@/config/auth.config";

const animeController = new Hono<{ Bindings: AuthType }>();

animeController.get("/:id", async (c) => {
	const idParam = c.req.param("id");
	const animeId = Number.parseInt(idParam, 10);

	if (Number.isNaN(animeId)) {
		return c.json({ success: false, message: "Invalid anime ID" }, 400);
	}

	try {
		const anime = await AnimeRepository.getAnimeWithRelations(animeId);
		if (!anime) {
			return c.json({ success: false, message: "Anime not found" }, 404);
		}
		return c.json({ success: true, data: anime });
	} catch (error) {
		return c.json({ success: false, message: "Internal Server Error" }, 500);
	}
});

export default animeController;
