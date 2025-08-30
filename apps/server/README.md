Trackyrs API Server (Hono + Bun)

Overview
- Lightweight HTTP API built with Hono, running on Bun.
- Auth handled by better-auth with a Drizzle adapter wired to the shared @trackyrs/database package.
- CORS enabled for the web client; credentials are supported (cookies for auth).

Quick start
- Workspace install (recommended from repo root):
	- bun install
	- bun run dev  # starts server and webapp via Turborepo
- App-only (from this folder):
	- bun run dev  # hot reload on port 3000

Default ports
- API server: http://localhost:3000

Required environment
- ALLOWED_CORS_ORIGIN: Web client origin (e.g., http://localhost:3001)
- BETTER_AUTH_SECRET: Secret for better-auth
- BETTER_AUTH_URL: Public base URL for this API (e.g., http://localhost:3000)
- Database settings are provided by @trackyrs/database. Configure its envs as documented in packages/database.

Key routes (summary)
- GET / → health text
- Auth (better-auth): /api/auth/* (sign-in, sign-up, session, etc.)
- Anime: /api/anime
	- GET /genres, /years, /top?limit=&page=
	- GET /season?season=Winter|Spring|Summer|Fall&year=YYYY
	- GET /search?years=&seasons=&types=&statuses=&genres=&title=&page=&limit=
	- GET /:id → details with relations
	- POST /:id/track (auth required) → update or create user track
- Manga: /api/manga
	- GET /genres, /years, /top, /ongoing
	- GET /search?years=&types=&statuses=&genres=&title=&page=&limit=
	- GET /:id, POST /:id/track (auth required)
- Characters: /api/characters
	- GET /search?name=&page=&limit=, GET /:id
- People: /api/people
	- GET /search?name=&page=&limit=, GET /:id
- Search (multi-entity): /api/search?query=foo or /api/search?q=foo
- Users: /api/users
	- GET /:username
	- GET /:username/anime-list, /:username/manga-list
	- GET /:username/anime-overview, /:username/manga-overview

Auth notes
- better-auth uses cookie-based sessions; CORS is configured with credentials=true.
- Ensure ALLOWED_CORS_ORIGIN matches the webapp origin; the client SDK in apps/webapp points to this server.

Troubleshooting
- 401 on protected routes: verify cookies are sent (credentials: 'include') and session exists.
- CORS errors: confirm ALLOWED_CORS_ORIGIN matches the webapp URL exactly (scheme, host, port).
- Base URL mismatch: BETTER_AUTH_URL must be the externally reachable URL used by the client.
