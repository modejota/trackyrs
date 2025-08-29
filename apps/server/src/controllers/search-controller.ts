import AnimeRepository from "@trackyrs/database/repositories/myanimelist/anime/anime-repository";
import CharacterRepository from "@trackyrs/database/repositories/myanimelist/character/character-repository";
import MangaRepository from "@trackyrs/database/repositories/myanimelist/manga/manga-repository";
import PeopleRepository from "@trackyrs/database/repositories/myanimelist/people-repository";
import { Hono } from "hono";
import type { AuthType } from "@/config/auth.config";

const searchController = new Hono<{
	Bindings: AuthType;
}>();

searchController.get("/", async (c) => {
	const queryParam = c.req.query("query") ?? c.req.query("q");
	const limitParam = c.req.query("limit");

	const raw = typeof queryParam === "string" ? queryParam : "";
	const query = raw.trim();
	const limit = limitParam ? Number.parseInt(limitParam, 10) : 6;

	if (Number.isNaN(limit) || limit <= 0 || limit > 50) {
		return c.json(
			{
				success: false,
				message: "Invalid limit. Must be a number between 1 and 50",
			},
			400,
		);
	}

	if (!query) {
		return c.json({
			success: true,
			data: { anime: [], manga: [], people: [], characters: [] },
		});
	}

	try {
		const [anime, manga, people, characters] = await Promise.all([
			AnimeRepository.quickSearch(query, limit, 0),
			MangaRepository.quickSearch(query, limit, 0),
			PeopleRepository.quickSearch(query, limit, 0),
			CharacterRepository.quickSearch(query, limit, 0),
		]);

		return c.json({
			success: true,
			data: { anime, manga, people, characters },
		});
	} catch (error) {
		return c.json({ success: false, message: "Internal Server Error" }, 500);
	}
});

export default searchController;
