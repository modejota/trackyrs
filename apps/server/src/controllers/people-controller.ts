import PeopleRepository from "@trackyrs/database/repositories/myanimelist/people-repository";
import { Hono } from "hono";
import type { AuthType } from "@/config/auth.config";

const peopleController = new Hono<{
	Bindings: AuthType;
}>();

peopleController.get("/search", async (c) => {
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
			data: { people: [], page, limit, total: 0, hasMore: false },
		});
	}

	const offset = (page - 1) * limit;

	try {
		const people = await PeopleRepository.search(nameParam, limit, offset);
		return c.json({
			success: true,
			data: {
				people,
				page,
				limit,
				total: people.length,
				hasMore: people.length === limit,
			},
		});
	} catch (error) {
		console.error("Error searching people:", error);
		return c.json({ success: false, message: "Internal Server Error" }, 500);
	}
});

peopleController.get("/:id", async (c) => {
	const idParam = c.req.param("id");
	const peopleId = Number.parseInt(idParam, 10);

	if (Number.isNaN(peopleId)) {
		return c.json({ success: false, message: "Invalid people ID" }, 400);
	}

	try {
		const people = await PeopleRepository.findByIdWithRelations(peopleId);
		if (!people) {
			return c.json({ success: false, message: "People not found" }, 404);
		}
		return c.json({ success: true, data: people });
	} catch (error) {
		console.error("Error fetching people:", error);
		return c.json({ success: false, message: "Internal Server Error" }, 500);
	}
});

export default peopleController;
