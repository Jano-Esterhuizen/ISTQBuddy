# ISTQBuddy

A learning app for ISTQB certifications — a polished landing page, Supabase auth, a freemium
learning portal (free sample exam, paid full access), and (later) an admin analytics dashboard.

This repository contains **Phase 1**: authentication, the marketing landing page, and a working
quiz flow seeded with the 66-question ISTQB CTFL v4.0 "Sample Exam A". Payments (Lemon Squeezy)
and admin analytics are planned for Phases 2 and 3.

## Stack

- **Backend** (`backend/`): .NET 9 / ASP.NET Core, Clean Architecture (Domain / Application /
  Infrastructure / Api), EF Core 9 + Npgsql, FluentValidation, Swashbuckle. Supabase JWT validated
  via JWKS. Multi-tenant: every query is scoped by the `UserId` from the JWT.
- **Frontend** (`frontend/`): Next.js 16 (App Router) + React 19 + TypeScript, Tailwind 3.4,
  shadcn-style UI on Radix, Axios (JWT interceptor), Framer Motion, Sonner. Supabase SSR auth.
- **Infra**: PostgreSQL + Supabase Auth/Storage, Docker → Render (backend), Vercel (frontend).

## Architecture

```
API Layer            Controllers, middleware, DI, JWT, Swagger
Infrastructure       AppDbContext, EF configs, migrations, seeder, CurrentUser, email
Application          Services (Exams/Attempts/Profiles/Entitlements), DTOs, validators, interfaces
Domain               Entities + enums (zero external dependencies)
```

Freemium is enforced **server-side**: the free sample (`Exam.IsFreeSample`) is open to any
authenticated user; every other exam requires a valid `FullAccess` entitlement (returns 403
otherwise). Phase 2 simply inserts a `FullAccess` entitlement from the Lemon Squeezy webhook.

## Running locally

### Backend

1. Create a Supabase project. Copy its URL and database connection string.
2. Configure `backend/src/ISTQBuddy.Api/appsettings.Development.json`:
   - `Supabase:Url` = `https://<project-ref>.supabase.co`
   - `ConnectionStrings:Default` = the **transaction pooler** connection (port 6543).
3. Apply the schema using the **direct** connection (port 5432):
   ```bash
   cd backend
   $env:ISTQBUDDY_MIGRATIONS_CONNECTION="Host=db.<ref>.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=<pw>;SSL Mode=Require;Trust Server Certificate=true"
   dotnet ef database update --project src/ISTQBuddy.Infrastructure --startup-project src/ISTQBuddy.Api
   ```
4. Run (seeds Sample Exam A on startup in Development):
   ```bash
   dotnet run --project src/ISTQBuddy.Api
   ```
   Swagger: `https://localhost:<port>/swagger`.

### Frontend

```bash
cd frontend
cp .env.example .env.local   # fill in Supabase URL/anon key + API URL
npm install
npm run dev                  # http://localhost:3000
```

In Supabase Auth settings, enable Email and Google providers, and add
`http://localhost:3000/auth/callback` as a redirect URL.

## Tests

```bash
cd backend && dotnet test    # scoring, entitlement gating, and an API start->submit->result flow
```

## Project status

- ✅ Phase 1 — auth, landing, seeded quiz flow, freemium gate
- ⏳ Phase 2 — Lemon Squeezy payments (checkout + signed webhook → FullAccess entitlement)
- ⏳ Phase 3 — admin analytics dashboard (Recharts)

_Practice tool · not affiliated with ISTQB._
