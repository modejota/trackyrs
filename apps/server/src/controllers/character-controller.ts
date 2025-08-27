import CharacterRepository from "@trackyrs/database/repositories/myanimelist/character/character-repository";
import { Hono } from "hono";
import type { AuthType } from "@/config/auth.config";

const characterController = new Hono<{
	Bindings: AuthType;
}>();

characterController.get("/search", async (c) => {
	const limitParam = c.req.query("limit");
	const pageParam = c.req.query("page");
	const nameParam = c.req.query("name");

	const limit = limitParam ? Number.parseInt(limitParam, 10) : 24;
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

	if (!nameParam || nameParam === "null" || !nameParam.trim()) {
		return c.json({
			success: true,
			data: { characters: [], page, limit, total: 0, hasMore: false },
		});
	}

	const offset = (page - 1) * limit;

	try {
		const characters = await CharacterRepository.search(
			nameParam,
			limit,
			offset,
		);
		return c.json({
			success: true,
			data: {
				characters,
				page,
				limit,
				total: characters.length,
				hasMore: characters.length === limit,
			},
		});
	} catch (error) {
		console.error("Error searching characters:", error);
		return c.json({ success: false, message: "Internal Server Error" }, 500);
	}
});

characterController.get("/:id", async (c) => {
	const idParam = c.req.param("id");
	const characterId = Number.parseInt(idParam, 10);

	if (Number.isNaN(characterId)) {
		return c.json({ success: false, message: "Invalid character ID" }, 400);
	}

	try {
		const character =
			await CharacterRepository.findByIdWithRelations(characterId);
		if (!character) {
			return c.json({ success: false, message: "Character not found" }, 404);
		}
		return c.json({ success: true, data: character });
	} catch (error) {
		console.error("Error fetching character:", error);
		return c.json({ success: false, message: "Internal Server Error" }, 500);
	}
});

export default characterController;
