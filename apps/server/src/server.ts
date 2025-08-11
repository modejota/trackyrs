import { Hono } from "hono";
import { cors } from "hono/cors";
import { type AuthType, auth } from "@/config/auth.config";

import animeController from "@/controllers/anime-controller";

const app = new Hono<{ Bindings: AuthType }>({
	strict: false,
});

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

app.use(
	cors({
		origin: process.env.ALLOWED_CORS_ORIGIN as string,
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["GET", "POST", "OPTIONS"],
		exposeHeaders: ["Content-Length"],
		maxAge: 600,
		credentials: true,
	}),
);
app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

app.route("/api/anime", animeController);

export default app;
