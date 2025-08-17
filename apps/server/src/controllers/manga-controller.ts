import MangaRepository from "@trackyrs/database/repositories/myanimelist/manga/manga-repository";
import { Hono } from "hono";
import type { AuthType } from "@/config/auth.config";

const mangaController = new Hono<{ Bindings: AuthType }>();

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
