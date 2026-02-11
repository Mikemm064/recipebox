# RecipeBox

Private personal cooking playbook built with Next.js App Router, Turso/libSQL, Drizzle ORM, Tailwind CSS, and Zod.

## Required environment variables

Create `.env.local` with:

```bash
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
APP_PASSWORD=your-single-app-password
```

## Setup

1. **Create a Turso database**
   - `turso db create recipebox`
2. **Get the database URL**
   - `turso db show recipebox --url`
3. **Create an auth token**
   - `turso db tokens create recipebox`
4. **Install dependencies**
   - `npm install`
5. **Run migrations**
   - `npm run db:migrate`
6. **Start development server**
   - `npm run dev`

## Database scripts

- `npm run db:generate` – generate Drizzle migrations from schema changes.
- `npm run db:migrate` – apply SQL migrations in `migrations/`.
- `npm run db:studio` – open Drizzle Studio.

## Deploying to Vercel

1. Push repo to GitHub.
2. Import project in Vercel.
3. Add environment variables in Vercel project settings:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `APP_PASSWORD`
4. Deploy.

## App features

- Password-protected app with middleware + login/logout.
- Categories with add/rename/delete.
- Dishes with notes, cooked date, and multiple source links.
- Global full-text search across dish title + notes with SQLite FTS5.
