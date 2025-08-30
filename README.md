# Trackyrs

Track what you watch and read — fast. Trackyrs is a modern anime and manga tracker with clean UX, real-time search, and data-driven profiles that surface insights about your habits.

## What you get
- Unified library for anime and manga with statuses, scores, rewatches/rereads, and progress.
- Powerful discovery: seasonal browsing, top lists, filters by year, season, type, status, and genres.
- Smart search across anime, manga, people, and characters.
- Rich user profiles: score histograms, genre breakdowns, year/season charts, time watched/read, and more.
- Secure login and password reset via email.

<img width="2558" height="1276" alt="Captura de pantalla 2025-08-30 182730" src="https://github.com/user-attachments/assets/1b2298db-a05a-4a28-be9a-615227ee24ad" />
<img width="2558" height="1275" alt="Captura de pantalla 2025-08-30 182813" src="https://github.com/user-attachments/assets/7a6cecb3-3bf8-4123-a572-0d92505a4a49" />
<img width="2555" height="1275" alt="Captura de pantalla 2025-08-30 182947" src="https://github.com/user-attachments/assets/b9cf65f8-4372-4d96-a564-92f0161d4b7d" />
<img width="2555" height="1276" alt="Captura de pantalla 2025-08-30 183205" src="https://github.com/user-attachments/assets/d44b004a-e771-48ac-a72e-1ccae0d6fdb5" />


## Tech at a glance
- Monorepo: Turborepo + TypeScript.
- Webapp: Next.js App Router (React 19), TanStack Query, shared UI kit based on shadcn/ui.
- API Server: Hono on Bun for ultra-fast HTTP with better-auth (Drizzle adapter) and CORS with credentials.
- Data: Drizzle ORM + PostgreSQL, curated Jikan-based scrapper CLI for ingestion.
- Email: Nodemailer sender with HTML/text templates for password reset.

## Architecture
- apps/
	- @trackyrs/webapp: Next.js UI (http://localhost:3001)
	- @trackyrs/server: Hono API (http://localhost:3000)
- packages/
	- @trackyrs/database: Drizzle schemas, repositories, migrations
	- @trackyrs/email: Email service (Nodemailer)
	- @trackyrs/ui: Shared React UI components
	- @trackyrs/utils: Shared utilities
	- jikan-scrapper: CLI tools for content ingestion

## Environment
- Common
	- DATABASE_URL=postgres://...
- Server (@trackyrs/server)
	- ALLOWED_CORS_ORIGIN=http://localhost:3001
	- BETTER_AUTH_SECRET=your-secret
	- BETTER_AUTH_URL=http://localhost:3000
- Webapp (@trackyrs/webapp)
	- NEXT_PUBLIC_HONO_SERVER_URL=http://localhost:3000
- Email (@trackyrs/email)
	- EMAIL_PROVIDER=smtp.example.com
	- EMAIL_USER=you@example.com
	- EMAIL_PASSWORD=app-password

Note on env placement
- Primary envs can live in a root .env/.env.local, but some tools (drizzle-kit and the email sender) load .env.local from their package directories. If you see missing envs, copy the relevant keys into packages/database/.env.local and packages/email/.env.local.

## Local development
- Requirements: Bun >= 1.2.21, PostgreSQL (via Docker).
- From the repo root:
	- `bun install`
	- `bun run dev`  # runs webapp (3001) and server (3000)
	- Open http://localhost:3001 (webapp) and http://localhost:3000 (API)

Build and run
- `bun run build`
- `bun run start`

API highlights
- Auth: /api/auth/* (better-auth handler, cookie-based sessions)
- Anime: /api/anime (genres, years, top, season, search, details, track)
- Manga: /api/manga (genres, years, top, ongoing, search, details, track)
- Characters: /api/characters (search, details)
- People: /api/people (search, details)
- Search: /api/search?q=...
- Users: /api/users/:username and profile analytics endpoints
