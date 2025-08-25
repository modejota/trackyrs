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

export default userController;
