Trackyrs Webapp (Next.js + React 19)

Overview
- Next.js App Router app that talks to the Trackyrs API server.
- Uses TanStack Query for data fetching, next-themes for theming, and shared @trackyrs/ui and @trackyrs/utils packages.

Quick start
- From repo root (recommended):
	- bun install
	- bun run dev  # starts webapp (3001) and server (3000) via Turborepo filters
- From this folder:
	- bun dev  # starts Next.js on port 3001

Default ports
- Webapp: http://localhost:3001
- API server: http://localhost:3000 (consumed by the webapp)

Required environment
- NEXT_PUBLIC_HONO_SERVER_URL: Base URL of the API server (e.g., http://localhost:3000)
	- Used by: app/api/*/queries.ts, lib/auth-client.ts, and other API callers

Key features
- Season browsing, top lists, and rich search for anime and manga.
- Character and people search with details pages.
- User profiles, lists, and overviews; integrates with cookie-based auth from the API.

Development tips
- If you see CORS or auth issues, ensure the server ALLOWED_CORS_ORIGIN matches http://localhost:3001 and this app’s NEXT_PUBLIC_HONO_SERVER_URL points to the server.
- When requesting protected routes, make sure fetch includes credentials.

Scripts
- dev: next dev --turbopack --port 3001
- build: next build --turbopack
- start: next start --port 3001
