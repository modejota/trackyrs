import type { Context, Next } from "hono";
import { auth } from "@/config/auth.config";

export const protect = async (c: Context, next: Next) => {
	const session = await auth.api.getSession({ headers: c.req.raw.headers });

	if (!session || !session.user) {
		return c.json(
			{
				success: false,
				message: "Unauthorized",
				error: "No valid session found",
			},
			401,
		);
	}

	c.set("user", session.user);
	c.set("session", session.session);

	await next();
};
