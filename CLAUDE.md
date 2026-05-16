# Chairside — Developer Guide

Dental lab platform connecting dentists and dental technicians for case management, messaging, and service visibility.

## Architecture

```
chairside/
  src/                    ← React frontend (compiled by esbuild)
    index.html            ← Entry point (loads /config.js + /bundle.js)
    styles/tokens.css     ← Design tokens (warm neutral palette)
    lib/
      api.js              ← All REST calls → Express backend (/api/*)
      realtime.js         ← Supabase Realtime subscriptions (WebSocket)
    context/
      AuthContext.jsx     ← Auth state, signIn/signUp/signOut
    components/
      ui/index.jsx        ← Shared primitives: Icon, Avatar, Button, Stat, etc.
      auth/Auth.jsx       ← Login + register (email/password)
      dentist/            ← Dentist screens
      tech/               ← Technician screens
      shared/             ← Chat thread, Profile
  server/                 ← Express.js backend
    index.js              ← Entry, serves static + /api/* routes
    middleware/auth.js    ← Verify Supabase JWT (Bearer token)
    routes/               ← auth, cases, labs, services, messages, shade, upload
    lib/supabase.js       ← Supabase service-role client (admin operations)
  scripts/
    build.js              ← esbuild: src/app.jsx → dist/bundle.js
    dev.js                ← esbuild watch + Express server
  dist/                   ← Generated (git-ignored)
  supabase-schema.sql     ← Base schema (run once in Supabase SQL editor)
  supabase-schema-additions.sql ← v2 additions (message_templates table)
```

## Data flow

```
Browser
  ├── REST (fetch)  → Express /api/*  → Supabase (service-role key)
  └── WebSocket     → Supabase Realtime (anon key + JWT)
```

All API calls use the Bearer token from `localStorage.cs_session.access_token`.  
The Express backend verifies the JWT via `supabase.auth.getUser(token)` before any DB operation.

## Setup

1. **Install deps**
   ```
   npm install
   ```

2. **Create `.env`** (copy from `.env.example`)
   ```
   SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_KEY=eyJ...   ← service_role key (keep secret)
   ANTHROPIC_API_KEY=sk-ant-...  ← optional, enables real shade analysis
   ```

3. **Run Supabase schema** — in Supabase SQL editor:
   - Run `supabase-schema.sql` first
   - Then run `supabase-schema-additions.sql`

4. **Dev**
   ```
   npm run dev      → builds frontend + starts Express on :3000
   ```

5. **Production build**
   ```
   npm run build    → bundles to dist/bundle.js
   node server/index.js
   ```

## Key patterns

- **No mock data** — real Supabase API calls only. Session stored in `localStorage.cs_session`.
- **Auth** — email/password via `POST /api/auth/signin`. Returns `{ user, session }`.
  - Session `access_token` sent as `Authorization: Bearer <token>` to all `/api/*` calls.
- **Realtime** — Supabase WebSocket for live message delivery and case stage updates.
  - `src/lib/realtime.js` exposes `subscribeToMessages(caseId, cb)` and `subscribeToCases(userId, cb)`.
- **Shade analysis** — `POST /api/shade` with `{ imageUrl }` or `{ imageBase64, mediaType }`.
  - Falls back to demo data if `ANTHROPIC_API_KEY` is not set.
- **File uploads** — multipart form to `POST /api/upload/:caseId`. Files stored in Supabase Storage (`case-attachments` bucket).

## Two user roles

| Feature | Dentist | Technician |
|---------|---------|-----------|
| Browse labs + services | ✓ | — |
| Send cases | ✓ | — |
| Upload payment proof | ✓ | — |
| Manage service catalog | — | ✓ |
| Advance case stages | — | ✓ |
| Confirm payment | — | ✓ |
| Message templates per stage | — | ✓ |
| AI shade analysis on images | ✓ | ✓ |

## Design system

Defined in `src/styles/tokens.css`. Key variables:
- `--bg`: `#f3efe8` (warm canvas)
- `--ink`: `#1c1612` (near-black)
- `--clay`: `#b4724a` (single warm accent)
- `--surface`: `#fdfbf6` (card background)
- Fonts: Geist (sans), Geist Mono, Newsreader (serif headings)

## Supabase schema additions (v2)

The `message_templates` table links templates to a service's stage indexes:
```sql
message_templates(id, service_id, lab_id, stage_index, body)
```
When a technician advances a case stage, the chat auto-suggests the template for that stage.
