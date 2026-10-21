# Octagon Poker Group Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the old SQLite prototype with a private record book for one home-game group: nights get logged (mostly by the owner the next day, optionally by players at the table), and the group sees winner-forward yearly standings, player pages, and a year-end recap.

**Architecture:** A single Next 16 App Router app on Railway with Postgres via Drizzle. Domain logic lives in plain TypeScript modules (`src/money`, `src/stats`, `src/players`, `src/nights`, `src/access`) that take explicit inputs and are tested with Vitest; server actions and pages are thin wrappers that resolve the viewer, parse input with Zod, call the domain, and revalidate. The owner signs in with Better Auth; everyone else gets edit access by opening the group's secret link once.

**Tech Stack:** Next 16.4, React 19.3, TypeScript 6, Tailwind 4 + existing shadcn components, Drizzle ORM 0.45 + drizzle-kit 0.31 + `pg`, Better Auth 1.7 (drizzle adapter), Zod 4, Vitest 5, Railway (`railway/iac`), GitHub Actions.

**Spec:** No separate design doc. The product decisions agreed in conversation on 2026-10-21 are the **Product** section below; executors treat it as the spec.

## Product

- One friend group, 4–13+ players per night, rotating attendance. The data model is group-scoped (every player and night belongs to a group) but the app runs exactly one group, created by the setup script. No group creation UI.
- Nobody uses the app mid-game. A night is entered after the fact as one row per player: total buy-in and total cash-out. Rebuy counts are not tracked.
- Two entry paths on the same night: the owner on desktop the next day filling the whole table, and players on their phone at the end of the night logging their own row. Anyone with access may add or fix any row on an **open** night.
- A night stays **open** until the owner closes it. Closing requires every seat to have a cash-out and total cash-out to equal total buy-in. Closing locks the winner of the night. The owner can reopen a closed night; nobody else can edit a closed night.
- Winner of the night: the player(s) with the highest net, only if that net is above zero. Ties produce co-winners.
- Every change to a night is recorded in an activity log (who did what, when) shown on the night page.
- **Access:** the owner signs in (email + password, single account, no public sign-up). Everyone else opens `/join/<code>`; the browser is then a member until the owner resets the code. Members pick "who are you" once (stored in a cookie) so the activity log can name them; no accounts in v1.
- **Visibility (default, confirm with owner):** private. Every page except `/join/*`, `/sign-in`, and `/api/*` requires the owner session or a valid member cookie.
- Owner-only powers: close/reopen nights, delete a night, reset the group link, merge duplicate players.
- **Seasons** are calendar years by night date. Stats default to the current year; past years and a lifetime view are reachable but never the default. Old SQLite data is discarded.
- **Group page** (mockup A): last closed night's winner on top; "Up this year" ranks players with net > 0 by net, green amounts; everyone at or below zero is listed unranked in gray, closest to zero first, with nights played; then recent nights (date, location, winner or "Open"). The ranking rule must live in one function so it can be swapped later.
- **Player page:** season net, nights played, nights won, biggest night, longest up-streak, and night-by-night history including down nights.
- **Night page:** date, location, typical buy-in, status, totals (in / out / left to count), the seat table, winner banner when closed, activity log.
- **Year-end recap** (`/recap/<year>`): final standings (same rule as the group page), most nights won, biggest single night, longest up-streak, and one card per player with net, nights played, nights won. Labeled "so far" while the year is in progress.

## Global Constraints

- Node 24, npm only. Dev server port `3410`; local Postgres host port `15436`. Use these in `package.json`, `.env.example`, `docker-compose.yml`, and `BETTER_AUTH_URL`.
- Versions: `drizzle-orm@^0.45.4`, `drizzle-kit@^0.31.11`, `pg@^8.23.1`, `@types/pg@^8.23.1`, `better-auth@^1.7.12`, `vitest@^5.0.5`, `tsx@^4.23.15`, `railway@^3.16.0`.
- Money is integer cents everywhere below the UI (`number`, validated integer ≥ 0). Night dates are Postgres `date` columns read as `'YYYY-MM-DD'` strings (`mode: 'string'`); no timezone math on them.
- IDs are `uuid` with `defaultRandom()` for app tables; Better Auth tables use its generated schema as-is.
- Repo rules from `~/.claude/CLAUDE.md` apply: no `as` assertions, `type` not `interface`, discriminated unions for results (`{ kind: 'conflict', … }`), no barrel files, zero comments by default, table-driven tests use object rows with a `name` field and `'$name'` titles.
- Domain code is co-located by feature: each domain folder owns its `schema.ts`, logic module, and tests. Pages under `src/app` import from the defining module.
- Commit messages: subject line plus one or two sentences; no co-author or tool attribution lines.
- Displayed negative amounts use U+2212 (`−$55`); positive net shows a plus (`+$118`); whole-dollar amounts render without cents (`$20`), others with two decimals (`$20.50`).

## Review Focus

1. **Two editors on one night** (a player logs at the table while the owner edits the next day, or two phones at once) — no silent overwrite; the second save of a stale row gets a conflict and the current values. Pinned in Task 5 (`upsertSeat` conflict test).
2. **Sloppy money input** — `"$1,200"`, `" 20 "`, `"20."`, `"20.5"` must parse; `"-5"`, `"1e3"`, `"20.555"`, `"abc"` must be rejected, and blank must mean "not entered" rather than zero. Pinned in Task 2 (`parseDollars` table).
3. **Ties and break-even nights** — two players tied for top net are co-winners; a night where nobody is up has no winner and nobody's "nights won" increments. Pinned in Task 2 (`nightWinners`, `standings` tests).
4. **A leaked or old link after reset** — a browser holding the previous code is not a member, and `/join/<old>` lands on the "link no longer works" page. Pinned in Task 3 (`isMemberCode` test) and Task 3's join route check.
5. **Duplicate people** — `"ivy "` and `"Ivy"` resolve to the same player on add; merging two players who sat in the same night is refused with those dates instead of corrupting the night. Pinned in Task 4 (`addPlayer`, `mergePlayers` tests).

---

## File Structure

```
docker-compose.yml                 Postgres 17 on 15436, creates octagon_poker + octagon_poker_test
docker/init-test-db.sql            CREATE DATABASE octagon_poker_test
.env.example                       DATABASE_URL, TEST_DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, OWNER_EMAIL, OWNER_PASSWORD, GROUP_NAME
drizzle.config.ts                  schema glob ./src/**/schema.ts, out ./drizzle
drizzle/                           generated SQL migrations (committed)
scripts/migrate.mjs                plain-JS migrator used locally, in tests' global setup, and as Railway preDeploy
scripts/setup.ts                   one-time: create owner account + the group (idempotent)
vitest.config.ts                   node env, @ alias, globalSetup
vitest.global-setup.ts             migrates TEST_DATABASE_URL
src/env.ts                         Zod-parsed server env
src/db/client.ts                   drizzle(pg Pool) with all schema modules
src/db/test-db.ts                  resetDb() truncation helper for DB tests
src/money/money.ts (+ .test.ts)    parseDollars, formatDollars, formatNet
src/stats/                         pure stats over closed nights
  nights.ts (+ .test.ts)           seatNet, nightWinners, nightBalance
  season.ts (+ .test.ts)           Season, nightsInSeason, parseSeason
  standings.ts (+ .test.ts)        standings()  ← the one ranking rule
  player-season.ts (+ .test.ts)    playerSeason()
  recap.ts (+ .test.ts)            recap()
src/auth/auth.ts                   createAuth(), auth
src/auth/schema.ts                 Better Auth tables (generated by `npx auth generate`)
src/auth/session.ts                getOwnerSession()
src/groups/schema.ts               groups table
src/groups/groups.ts (+ .test.ts)  getGroup, createGroup, resetInviteCode, renameGroup
src/access/                        viewer resolution and cookies
  invite.ts (+ .test.ts)           generateInviteCode, isMemberCode
  viewer.ts                        getViewer(), requireViewer(), requireOwner(), actorFor()
src/players/schema.ts              players table
src/players/players.ts (+ .test.ts) addPlayer, listPlayers, getPlayer, mergePlayers
src/nights/schema.ts               nights, seats, night_events tables
src/nights/nights.ts (+ .test.ts)  night commands + queries
src/nights/actions.ts              server actions for night pages
src/players/actions.ts             server actions: addPlayerAction, chooseMeAction, mergePlayersAction
src/groups/actions.ts              server actions: resetInviteAction, renameGroupAction
src/app/layout.tsx                 root layout (keeps Inter + Toaster)
src/app/(group)/layout.tsx         privacy gate + top nav
src/app/(group)/page.tsx           group page
src/app/(group)/nights/new/page.tsx
src/app/(group)/nights/[id]/page.tsx  + seat-table.tsx, who-are-you.tsx, night-owner-actions.tsx, activity-log.tsx
src/app/(group)/players/[id]/page.tsx
src/app/(group)/recap/[year]/page.tsx
src/app/(group)/settings/page.tsx  + merge-players-form.tsx, invite-link-card.tsx
src/app/join/[code]/route.ts
src/app/join/invalid/page.tsx
src/app/sign-in/page.tsx           + sign-in-form.tsx
src/app/api/auth/[...all]/route.ts
src/app/api/health/route.ts
Dockerfile
.railway/railway.ts
.github/workflows/ci.yml           gains Postgres service + npm test
```

Removed in Task 1: `mydb.sqlite`, `src/dal/`, `src/lib/db.ts`, `src/lib/init-db.ts`, `src/store/`, `src/types/`, `src/components/game/`, `src/components/player/`, `src/components/charts/`, `src/components/editable-table.tsx`, `src/app/(home)/`, `src/app/@modal/`, `src/app/game/`, `src/app/player/`, `src/app/actions/`; deps `sqlite`, `sqlite3`, `zustand`, `recharts`, `react-is` (if present).

---

### Task 1: Clean slate, Postgres, Drizzle schema, test harness

**Files:**
- Delete: everything listed under "Removed in Task 1".
- Create: `docker-compose.yml`, `docker/init-test-db.sql`, `.env.example`, `drizzle.config.ts`, `scripts/migrate.mjs`, `vitest.config.ts`, `vitest.global-setup.ts`, `src/env.ts`, `src/db/client.ts`, `src/db/test-db.ts`, `src/groups/schema.ts`, `src/players/schema.ts`, `src/nights/schema.ts`, `src/db/schema.test.ts`, `src/app/api/health/route.ts`, temporary `src/app/page.tsx` ("Octagon Poker — rebuilding")
- Modify: `package.json`, `src/app/layout.tsx` (drop `initDb`, drop `modal` slot, title "Octagon Poker"), `.gitignore` (add `.env`), `.github/workflows/ci.yml`, `README.md` (getting-started: docker compose, migrate, setup, dev)

**Interfaces:**
- Produces:
  - `db` from `src/db/client.ts`: `NodePgDatabase<typeof schema>` built from `src/groups/schema`, `src/players/schema`, `src/nights/schema` (and `src/auth/schema` once Task 3 adds it).
  - Tables: `groups { id, name, inviteCode (unique), ownerUserId text null, createdAt }`, `players { id, groupId → groups, name, createdAt }` with unique index on `(group_id, lower(name))`, `nights { id, groupId, date (date, mode 'string'), location text null, buyInCents int null, status nightStatus default 'open', closedAt timestamptz null, createdAt }`, `seats { id, nightId → nights cascade, playerId → players, buyInCents int not null default 0, cashOutCents int null, updatedAt timestamptz not null default now }` unique `(night_id, player_id)` with checks `buy_in_cents >= 0` and `cash_out_cents >= 0`, `nightEvents { id, nightId → nights cascade, actorKind actorKind, actorPlayerId → players null (on delete set null), action text, detail jsonb not null default {}, createdAt }`.
  - Enums: `nightStatus = pgEnum('night_status', ['open', 'closed'])`, `actorKind = pgEnum('actor_kind', ['owner', 'member'])`.
  - `env` from `src/env.ts`: `{ DATABASE_URL: string; BETTER_AUTH_SECRET: string; BETTER_AUTH_URL: string }` (Zod, parsed lazily on first access so `next build` and `docker build` need no env).
  - `resetDb(): Promise<void>` from `src/db/test-db.ts`: `TRUNCATE … RESTART IDENTITY CASCADE` on every app and auth table.
  - npm scripts: `dev` (`next dev -p 3410`), `start` (`next start -p ${PORT:-3410}`), `db:generate` (`drizzle-kit generate`), `db:migrate` (`node --env-file-if-exists=.env scripts/migrate.mjs`), `db:studio`, `test` (`vitest run`), `check-all` unchanged.

- [ ] **Step 1: Remove the old app** — delete the listed files and dependencies (`npm uninstall sqlite sqlite3 zustand recharts`), delete `src/components/ui/chart.tsx` (its only dependency was recharts), replace `src/app/page.tsx` with a placeholder, and run `npm run type-check` to confirm nothing still imports the removed modules.
- [ ] **Step 2: Local Postgres** — `docker-compose.yml` with `postgres:17-alpine`, user/password `octagon`, db `octagon_poker`, port `15436:5432`, a named volume, healthcheck `pg_isready -U octagon`, and `docker/init-test-db.sql` mounted into `/docker-entrypoint-initdb.d/`. `.env.example`:
  ```
  DATABASE_URL=postgresql://octagon:octagon@localhost:15436/octagon_poker
  TEST_DATABASE_URL=postgresql://octagon:octagon@localhost:15436/octagon_poker_test
  BETTER_AUTH_SECRET=replace-with-npx-auth-secret
  BETTER_AUTH_URL=http://localhost:3410
  OWNER_EMAIL=
  OWNER_PASSWORD=
  GROUP_NAME=Octagon Poker
  ```
  Run `docker compose up -d --wait` → both databases exist (`docker compose exec postgres psql -U octagon -lqt | cut -d'|' -f1` lists both).
- [ ] **Step 3: Install** `drizzle-orm pg dotenv` and dev `drizzle-kit @types/pg vitest tsx` at the Global Constraints versions; write the three `schema.ts` files and `src/db/client.ts` per Interfaces.
- [ ] **Step 4: Migrations** — `drizzle.config.ts` (`dialect: 'postgresql'`, `schema: './src/**/schema.ts'`, `out: './drizzle'`, url from `DATABASE_URL`); `scripts/migrate.mjs` uses `drizzle-orm/node-postgres/migrator` `migrate(db, { migrationsFolder: 'drizzle' })` against `process.env.DATABASE_URL` and exits non-zero on failure. Run `npm run db:generate` then `npm run db:migrate` → exits 0 and `\dt` shows `groups players nights seats night_events`.
- [ ] **Step 5: Test harness** — `vitest.config.ts` (environment `node`, alias `@` → `./src`, `globalSetup: './vitest.global-setup.ts'`, `fileParallelism: false`, `env` setting `DATABASE_URL` from `TEST_DATABASE_URL` plus test values for `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL`); the global setup runs `scripts/migrate.mjs` logic against `TEST_DATABASE_URL`.
- [ ] **Step 6: Write the failing schema test** `src/db/schema.test.ts`:
  ```ts
  it('rejects a second player whose name differs only by case', async () => {
    const [group] = await db.insert(groups).values({ name: 'G', inviteCode: 'code-1' }).returning();
    await db.insert(players).values({ groupId: group.id, name: 'Ivy' });
    await expect(db.insert(players).values({ groupId: group.id, name: 'ivy' })).rejects.toThrow();
  });
  ```
  The second test inserts a group, player, and night, then a seat with `buyInCents: -1`, and expects the insert to reject. Both use `beforeEach(resetDb)`. Run `npm test -- src/db/schema.test.ts` → FAIL until the unique index and check constraints exist; fix the schema, regenerate, re-run → PASS.
- [ ] **Step 7: Health route** — `GET /api/health` returns `{ ok: true }` after `SELECT 1` succeeds, 503 `{ ok: false }` otherwise. `npm run dev`, `curl -s localhost:3410/api/health` → `{"ok":true}`.
- [ ] **Step 8: CI** — add to `ci.yml` a `services.postgres` (`postgres:17-alpine`, user/password `octagon`, db `octagon_poker_test`, port `15436:5432`, pg_isready health options), env `DATABASE_URL` and `TEST_DATABASE_URL` both pointing at `octagon_poker_test`, `BETTER_AUTH_SECRET: ci-secret-at-least-32-characters-long`, `BETTER_AUTH_URL: http://localhost:3410`, and a `npm test` step between `check-all` and `build`.
- [ ] **Step 9: Verify and commit** — `npm run check-all && npm test && npm run build` all pass.
  ```bash
  git add -A && git commit -m "Replace SQLite prototype with Postgres and Drizzle" -m "Removes the old DAL, routes, and store, adds the group/player/night schema with migrations, a local Postgres on 15436, and a Vitest harness that runs against a test database in CI."
  ```

### Task 2: Money and stats (pure)

**Files:**
- Create: `src/money/money.ts`, `src/money/money.test.ts`, `src/stats/nights.ts`, `src/stats/nights.test.ts`, `src/stats/season.ts`, `src/stats/season.test.ts`, `src/stats/standings.ts`, `src/stats/standings.test.ts`, `src/stats/player-season.ts`, `src/stats/player-season.test.ts`, `src/stats/recap.ts`, `src/stats/recap.test.ts`

**Interfaces:**
- Produces:
  - `parseDollars(input: string): { kind: 'empty' } | { kind: 'amount'; cents: number } | { kind: 'invalid' }`
  - `formatDollars(cents: number): string` and `formatNet(cents: number): string` (`+$118`, `−$55`, `$0`)
  - `type SeatResult = { playerId: string; buyInCents: number; cashOutCents: number }`
  - `type ClosedNight = { id: string; date: string; seats: SeatResult[] }`
  - `seatNet(seat: SeatResult): number`
  - `nightWinners(seats: SeatResult[]): string[]`
  - `nightBalance(seats: { playerId: string; buyInCents: number; cashOutCents: number | null }[]): { kind: 'balanced'; totalCents: number } | { kind: 'missing-cash-out'; playerIds: string[] } | { kind: 'off'; inCents: number; outCents: number } | { kind: 'empty' }`
  - In `season.ts`: `type Season = number | 'all'`; `nightsInSeason(nights: ClosedNight[], season: Season): ClosedNight[]`; `parseSeason(value: string | undefined, currentYear: number): Season` (`'all'` → `'all'`, a 4-digit year → that year, anything else → `currentYear`).
  - `type Standing = { playerId: string; netCents: number; nightsPlayed: number; nightsWon: number }`; `standings(nights: ClosedNight[]): { ranked: Standing[]; unranked: Standing[] }`
  - `type PlayerSeason = { playerId: string; netCents: number; nightsPlayed: number; nightsWon: number; biggestNight: { nightId: string; date: string; netCents: number } | null; longestUpStreak: number; history: { nightId: string; date: string; netCents: number; won: boolean }[] }`; `playerSeason(nights: ClosedNight[], playerId: string): PlayerSeason`
  - `type Recap = { standings: ReturnType<typeof standings>; mostNightsWon: { playerIds: string[]; count: number } | null; biggestNight: { playerId: string; nightId: string; date: string; netCents: number } | null; longestUpStreak: { playerIds: string[]; count: number } | null; players: PlayerSeason[] }`; `recap(nights: ClosedNight[]): Recap`

- [ ] **Step 1: Write the failing money table test** — rows (name / input / expected): blank `''` → empty; whitespace `'  '` → empty; whole dollars `'20'` → 2000; padded `' 20 '` → 2000; trailing dot `'20.'` → 2000; one decimal `'20.5'` → 2050; dollar sign and commas `'$1,200.50'` → 120050; negative `'-5'` → invalid; exponent `'1e3'` → invalid; three decimals `'20.555'` → invalid; letters `'abc'` → invalid; misplaced comma `'1,20'` → invalid. Format rows: `formatDollars(2000)` → `'$20'`, `formatDollars(2050)` → `'$20.50'`, `formatDollars(120000)` → `'$1,200'`, `formatNet(11800)` → `'+$118'`, `formatNet(-5500)` → `'−$55'`, `formatNet(0)` → `'$0'`.
- [ ] **Step 2: Run** `npm test -- src/money` → FAIL (module missing).
- [ ] **Step 3: Implement** `src/money/money.ts` — regex `^\$?(\d{1,3}(,\d{3})+|\d+)(\.\d{0,2})?$` on the trimmed input, then integer math (no float multiply); format with `Intl.NumberFormat('en-US')`.
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Write failing stats tests:**
  - `nightWinners`: single top net → `['a']`; tie at the top → both ids; everyone at or below zero → `[]`.
  - `nightBalance`: no seats → `empty`; a seat with `cashOutCents: null` → `missing-cash-out` with that id; in 6000 / out 5800 → `off` with both totals; in = out → `balanced`.
  - `nightsInSeason`: `'2025-12-31'` excluded from 2026, `'2026-01-01'` included, `'all'` returns everything.
  - `parseSeason` table: undefined → current year; `'2025'` → 2025; `'all'` → `'all'`; `'abc'` → current year; `'20255'` → current year.
  - `standings` with the mockup season (Sid +412, Ivy +265, Ethan +140, Marco +38, Priya −55, Johnny −180, Tyler −260, Dev −360, built from a few nights): `ranked` ids in that order for positives; `unranked` = Priya, Johnny, Tyler, Dev; a player at exactly 0 lands in `unranked`; ranked ties break by `nightsWon` desc, then `nightsPlayed` asc, then `playerId`; a night with co-winners increments `nightsWon` for both; a break-even night increments nobody.
  - `playerSeason`: history sorted by date ascending; `biggestNight` is the max positive net (null if never up); `longestUpStreak` counts consecutive attended nights with net > 0 (nights the player skipped don't break a streak); unknown player → zeros and empty history.
  - `recap`: `mostNightsWon`/`longestUpStreak` return all tied ids; all three are `null` for a season with no closed nights; `players` contains one `PlayerSeason` per player who sat at least once.
- [ ] **Step 6: Run** `npm test -- src/stats` → FAIL.
- [ ] **Step 7: Implement** the five stats modules; `standings.ts` is the only place the ranking rule lives, and `recap` calls `standings` rather than re-deriving it.
- [ ] **Step 8: Run** → PASS; `npm run check-all` passes.
- [ ] **Step 9: Commit** — `git commit -m "Add money parsing and season stats" -m "Pure, table-tested modules for dollar input, night winners and balance, yearly standings, player seasons, and the year-end recap."`

### Task 3: Owner sign-in, group setup, member access

**Files:**
- Create: `src/auth/auth.ts`, `src/auth/schema.ts` (generated), `src/auth/session.ts`, `src/app/api/auth/[...all]/route.ts`, `src/app/sign-in/page.tsx`, `src/app/sign-in/sign-in-form.tsx`, `src/groups/groups.ts`, `src/groups/groups.test.ts`, `src/access/invite.ts`, `src/access/invite.test.ts`, `src/access/viewer.ts`, `src/app/join/[code]/route.ts`, `src/app/join/invalid/page.tsx`, `src/app/(group)/layout.tsx`, `scripts/setup.ts`
- Modify: `src/db/client.ts` (add auth schema), `src/db/test-db.ts` (truncate auth tables), `src/groups/schema.ts` (`ownerUserId` → FK to `user.id`), `package.json` (`setup` script: `tsx --env-file-if-exists=.env scripts/setup.ts`), move the placeholder home to `src/app/(group)/page.tsx`

**Interfaces:**
- Consumes: `db`, `groups` table, `env` (Task 1).
- Produces:
  - `createAuth(options: { allowSignUp: boolean })` returning a `betterAuth({ database: drizzleAdapter(db, { provider: 'pg', schema }), emailAndPassword: { enabled: true, disableSignUp: !options.allowSignUp }, plugins: [nextCookies()] })` instance; `auth = createAuth({ allowSignUp: false })`. The app never enables sign-up; only `scripts/setup.ts` does.
  - `getOwnerSession(): Promise<{ userId: string } | null>` — `auth.api.getSession({ headers: await headers() })`, and the user must equal the group's `ownerUserId`.
  - `getGroup(): Promise<Group>` (the single group; throws `'No group yet. Run npm run setup.'` if none), `createGroup(input: { name: string; ownerUserId: string }): Promise<Group>`, `resetInviteCode(groupId: string): Promise<string>`, `renameGroup(groupId: string, name: string): Promise<void>`.
  - `generateInviteCode(): string` — `randomBytes(18).toString('base64url')` (24 chars); `isMemberCode(cookieValue: string | undefined, currentCode: string): boolean` — constant-time compare, false for undefined or length mismatch.
  - Cookies: `op_member` (the invite code; httpOnly, `sameSite: 'lax'`, `secure` in production, `maxAge` 400 days), `op_player` (player id; same flags).
  - `type Viewer = { role: 'owner'; userId: string; group: Group } | { role: 'member'; group: Group; playerId: string | null }`; `getViewer(): Promise<Viewer | null>`; `requireViewer(): Promise<Viewer>` (for server actions; throws `Error('Not allowed')` when there is no viewer, since pages rely on the layout gate); `requireOwner(): Promise<Extract<Viewer, { role: 'owner' }>>` (throws a 404 via `notFound()` for non-owners); `type Actor = { kind: 'owner' } | { kind: 'member'; playerId: string | null }`; `actorFor(viewer: Viewer): Actor`.

- [ ] **Step 1: Auth tables** — install `better-auth`, write `createAuth`, run `npx auth@1.7.12 generate` (check `--help` for the output flag) to produce `src/auth/schema.ts` in Drizzle format, then `npm run db:generate && npm run db:migrate`.
- [ ] **Step 2: Write failing tests** — `invite.test.ts`: generated codes are 24 URL-safe chars and differ across calls; `isMemberCode` table: matching code → true; previous code after reset → false; undefined cookie → false; different length → false. `groups.test.ts`: `resetInviteCode` returns a new code, persists it, and the old code no longer matches via `isMemberCode`; `getGroup` throws the setup message on an empty database.
- [ ] **Step 3: Run** `npm test -- src/access src/groups` → FAIL.
- [ ] **Step 4: Implement** `invite.ts`, `groups.ts`, `session.ts`, `viewer.ts`.
- [ ] **Step 5: Run** → PASS.
- [ ] **Step 6: Setup script** — `scripts/setup.ts` reads `OWNER_EMAIL`, `OWNER_PASSWORD`, `GROUP_NAME`; if no owner user exists it calls `createAuth({ allowSignUp: true }).api.signUpEmail({ body: { email, password, name: 'Owner' } })`; if no group exists it calls `createGroup`; it prints the join URL `${BETTER_AUTH_URL}/join/<code>`. Running it twice changes nothing and prints the same URL.
- [ ] **Step 7: Routes and pages** — `api/auth/[...all]` exports `toNextJsHandler(auth)`; `/sign-in` is a client form calling `authClient.signIn.email` (`createAuthClient` from `better-auth/react`) then `router.replace('/')`, with an inline error for bad credentials; `/join/[code]` compares against the current code, sets `op_member` and redirects to `/` on match, otherwise redirects to `/join/invalid` ("This link doesn't work anymore. Ask for the current group link."); `(group)/layout.tsx` calls `getViewer()` and renders a small "Ask for the group link" page when null, otherwise a top bar with the group name, a Sign in / Settings link for the owner, and the children.
- [ ] **Step 8: Verify** — `npm run setup` prints a join URL; in a fresh browser `/` shows the gate; the join URL lands on the placeholder home; `/sign-in` with the owner credentials works and a wrong password shows the error; a public `POST /api/auth/sign-up/email` returns 400 `EMAIL_PASSWORD_SIGN_UP_DISABLED`. `npm run check-all && npm test` pass.
- [ ] **Step 9: Commit** — `git commit -m "Add owner sign-in and group link access" -m "Better Auth handles the single owner account with sign-up disabled; everyone else becomes a member by opening the group's secret join link, which the owner can reset."`

### Task 4: Players

**Files:**
- Create: `src/players/players.ts`, `src/players/players.test.ts`, `src/players/actions.ts`

**Interfaces:**
- Consumes: `db`, `players`, `seats`, `nights` tables; `requireViewer`, `requireOwner` (Task 3).
- Produces:
  - `type Player = { id: string; groupId: string; name: string }`
  - `addPlayer(input: { groupId: string; name: string }): Promise<{ kind: 'added'; player: Player } | { kind: 'exists'; player: Player } | { kind: 'invalid-name' }>` — trims and collapses inner whitespace; empty or > 40 chars → `invalid-name`; case-insensitive match → `exists`.
  - `listPlayers(groupId: string): Promise<Player[]>` sorted by name.
  - `getPlayer(groupId: string, playerId: string): Promise<Player | null>`
  - `mergePlayers(input: { groupId: string; fromId: string; intoId: string }): Promise<{ kind: 'merged' } | { kind: 'same-night'; dates: string[] } | { kind: 'not-found' } | { kind: 'same-player' }>` — in one transaction moves `seats.playerId` and `nightEvents.actorPlayerId` from `fromId` to `intoId`, then deletes `fromId`.
  - Server actions: `addPlayerAction(formData: FormData)`, `chooseMeAction(playerId: string)` (sets `op_player` after verifying the player belongs to the group), `mergePlayersAction(formData: FormData)` (owner).

- [ ] **Step 1: Write failing tests** — table for `addPlayer`: new name → added; `'ivy '` after `'Ivy'` → exists with Ivy's id; `'  Mary   Jo '` → stored as `'Mary Jo'`; `''` → invalid-name; 41 chars → invalid-name. `mergePlayers`: seats and activity-log actor move to the target and the source row is gone; both players seated on `'2026-03-07'` → `same-night` with `['2026-03-07']` and nothing changed; `fromId === intoId` → `same-player`; unknown id → `not-found`.
- [ ] **Step 2: Run** `npm test -- src/players` → FAIL.
- [ ] **Step 3: Implement** `players.ts` and `actions.ts` (actions parse with Zod, call the domain, `revalidatePath('/', 'layout')`, and return the domain result for the form to render).
- [ ] **Step 4: Run** → PASS; `npm run check-all` passes.
- [ ] **Step 5: Commit** — `git commit -m "Add players with duplicate-safe names and merging" -m "Names are normalized and unique per group regardless of case, and the owner can merge two players unless they sat in the same night."`

### Task 5: Nights domain

**Files:**
- Create: `src/nights/nights.ts`, `src/nights/nights.test.ts`

**Interfaces:**
- Consumes: `db`, night tables (Task 1), `Actor` (Task 3), `nightBalance`, `nightWinners`, `type ClosedNight`, `type Season` (Task 2), `Player` (Task 4).
- Produces:
  - `createNight(input: { groupId: string; date: string; location: string | null; buyInCents: number | null }, actor: Actor): Promise<{ id: string }>` — logs `night.create`.
  - `updateNight(input: { nightId: string; date: string; location: string | null; buyInCents: number | null }, actor: Actor): Promise<{ kind: 'saved' } | { kind: 'night-closed' } | { kind: 'not-found' }>`
  - `type SeatView = { playerId: string; playerName: string; buyInCents: number; cashOutCents: number | null; updatedAt: Date }`
  - `type NightDetail = { id: string; date: string; location: string | null; buyInCents: number | null; status: 'open' | 'closed'; seats: SeatView[]; events: { id: string; actorKind: 'owner' | 'member'; actorName: string | null; action: string; detail: unknown; createdAt: Date }[]; winners: string[] }` (winners empty while open).
  - `getNight(groupId: string, nightId: string): Promise<NightDetail | null>`
  - `upsertSeat(input: { nightId: string; playerId: string; buyInCents: number; cashOutCents: number | null; expectedUpdatedAt: Date | null }, actor: Actor): Promise<{ kind: 'saved'; updatedAt: Date } | { kind: 'conflict'; current: SeatView } | { kind: 'night-closed' } | { kind: 'not-found' }>` — `expectedUpdatedAt: null` means "creating"; if the seat already exists that is a conflict. Uses `UPDATE … WHERE updated_at = $expected` so the check and write are one statement. Logs `seat.add` or `seat.update` with before/after cents in `detail`.
  - `removeSeat(input: { nightId: string; playerId: string }, actor: Actor): Promise<{ kind: 'removed' } | { kind: 'night-closed' } | { kind: 'not-found' }>`
  - `closeNight(nightId: string): Promise<{ kind: 'closed'; winners: string[] } | { kind: 'not-balanced'; balance: Exclude<ReturnType<typeof nightBalance>, { kind: 'balanced' }> } | { kind: 'not-found' }>` — owner-only at the action layer; logs `night.close`.
  - `reopenNight(nightId: string): Promise<{ kind: 'reopened' } | { kind: 'not-found' }>` — logs `night.reopen`.
  - `deleteNight(nightId: string): Promise<{ kind: 'deleted' } | { kind: 'not-found' }>`
  - `listClosedNights(groupId: string): Promise<ClosedNight[]>` (all seasons; callers filter with `nightsInSeason`).
  - `listNights(groupId: string, season: Season): Promise<{ id: string; date: string; location: string | null; status: 'open' | 'closed'; winnerNames: string[] }[]>` newest first, open nights included.

- [ ] **Step 1: Write failing tests** (`beforeEach(resetDb)` plus a seeded group and players):
  - Creating a night and seating two players returns both seats from `getNight` with names, and two activity-log rows naming the member actor.
  - **Conflict:** player A saves Ivy's seat (gets `updatedAt` t1); owner saves Ivy's seat with `expectedUpdatedAt: t1` → saved (t2); player A saves again with `expectedUpdatedAt: t1` → `conflict` carrying the owner's values, and the row still has the owner's values.
  - Creating a seat that already exists (`expectedUpdatedAt: null`) → `conflict`.
  - `closeNight` with a missing cash-out → `not-balanced` / `missing-cash-out`; with in 6000 / out 5800 → `not-balanced` / `off`; balanced → `closed` with winners; afterwards `upsertSeat`, `removeSeat`, `updateNight` each return `night-closed`.
  - `reopenNight` then `upsertSeat` succeeds again; `getNight(...).winners` is empty while open.
  - `listClosedNights` excludes open nights; `listNights(groupId, 2026)` excludes a `'2025-12-31'` night and lists co-winner names for a tied night.
  - `deleteNight` removes seats and events with it.
- [ ] **Step 2: Run** `npm test -- src/nights` → FAIL.
- [ ] **Step 3: Implement** `nights.ts`; every command runs in a transaction that writes the change and its `nightEvents` row together.
- [ ] **Step 4: Run** → PASS; `npm run check-all` passes.
- [ ] **Step 5: Commit** — `git commit -m "Add night ledger with balance-checked closing" -m "Seats save individually with an updated-at guard so concurrent editors get a conflict instead of overwriting each other, and closing requires every cash-out and matching totals."`

### Task 6: Night pages

**Files:**
- Create: `src/nights/actions.ts`, `src/app/(group)/nights/new/page.tsx`, `src/app/(group)/nights/[id]/page.tsx`, `src/app/(group)/nights/[id]/seat-table.tsx`, `src/app/(group)/nights/[id]/who-are-you.tsx`, `src/app/(group)/nights/[id]/night-owner-actions.tsx`, `src/app/(group)/nights/[id]/activity-log.tsx`

**Interfaces:**
- Consumes: Task 5 commands and queries, `parseDollars`/`formatDollars`/`formatNet`/`nightBalance` (Task 2), `addPlayerAction`/`chooseMeAction` (Task 4), `requireViewer`/`requireOwner`/`actorFor` (Task 3).
- Produces: server actions `createNightAction(formData)`, `updateNightAction(formData)`, `saveSeatAction(input: { nightId: string; playerId: string; buyIn: string; cashOut: string; expectedUpdatedAt: string | null })` returning the `upsertSeat` result or `{ kind: 'invalid'; field: 'buyIn' | 'cashOut' }`, `removeSeatAction`, `closeNightAction`, `reopenNightAction`, `deleteNightAction` (the last three call `requireOwner`). Each calls `revalidatePath` for the night, `/`, and affected player pages.

- [ ] **Step 1: New night** — form with date (default today, local), location (optional), typical buy-in (optional, `parseDollars`); on success redirect to the night page. A "Log a night" button appears on the group page header (temporary placeholder page is fine until Task 7).
- [ ] **Step 2: Seat table** (`seat-table.tsx`, client) — one row per seat: name, buy-in input, cash-out input, net (only when cash-out is entered), Save; plus an "Add player" row with a combobox over `listPlayers` that offers "Add "<typed name>"" when no match (calls `addPlayerAction`, then seats them with the night's typical buy-in prefilled). Keyboard flow for the owner's desktop entry: Tab moves buy-in → cash-out → next row; Enter in either input saves the row and focuses the next row's buy-in. A `conflict` result replaces the row with the current values and shows a toast "Someone else just changed Ivy's row — showing their numbers." A `invalid` result outlines the field with "Enter an amount like 20 or 20.50". Closed nights render the same table read-only.
- [ ] **Step 3: Night header and totals** — date, location, typical buy-in, status pill (Open / Closed), and the totals strip: In, Out, Left to count (from `nightBalance`, showing which players are missing a cash-out). Closed nights show the winner banner ("Ivy took it +$118", co-winners joined with "and").
- [ ] **Step 4: Who are you** — members with no `op_player` see a one-line prompt above the table ("Who are you?" select + "I'm new") that calls `chooseMeAction`; it never blocks editing.
- [ ] **Step 5: Owner actions** — Close night (disabled with the reason while `nightBalance` isn't balanced), Reopen, Delete (confirm dialog), Edit details. Non-owners see none of these.
- [ ] **Step 6: Activity log** — collapsed by default, newest first: "9:41pm · Ivy updated Ivy: cash-out $0 → $178", actor shown as the owner's label "Host" or the member's chosen name or "Someone with the link".
- [ ] **Step 7: Verify in a browser** — `npm run dev`; as owner create a night, seat 6 players using only the keyboard, try closing while unbalanced (blocked with reason), balance and close (winner banner). In a second browser profile joined via the link, pick a name and edit a row on an open night; edit the same row from the owner window with the stale page open and confirm the conflict toast. Check the night page at 390px width. Screenshot each state. `npm run check-all && npm test` pass.
- [ ] **Step 8: Commit** — `git commit -m "Add night entry and closing pages" -m "A keyboard-friendly seat table for next-day entry, phone-friendly self-logging with a who-are-you prompt, owner close/reopen/delete, and the night's activity log."`

### Task 7: Group page and player pages

**Files:**
- Modify: `src/app/(group)/page.tsx`
- Create: `src/app/(group)/players/[id]/page.tsx`, `src/app/(group)/season-switcher.tsx`

**Interfaces:**
- Consumes: `listClosedNights`, `listNights` (Task 5), `nightsInSeason`, `parseSeason`, `standings`, `nightWinners`, `playerSeason` (Task 2), `listPlayers`/`getPlayer` (Task 4).
- Produces: `<SeasonSwitcher seasons={number[]} current={Season} />` in `season-switcher.tsx`, reused by the player and recap pages.

- [ ] **Step 1: Group page** per Product (mockup A): header with group name and season switcher (`?season=2026`, years that have nights plus the current one, and "All time"); last closed night card in the season; "Up this year" ranked list; unranked gray list with nights played; recent nights list linking to night pages; empty state for a season with no closed nights ("No nights logged in 2027 yet" plus a link to the previous year's recap when it exists). Names link to player pages.
- [ ] **Step 2: Player page** — season switcher, stat tiles (Net, Nights played, Nights won, Biggest night, Longest up-streak), and a history list (date → night page, net colored green when up, gray when down, trophy marker when won). 404 for players outside the group.
- [ ] **Step 3: Verify in a browser** — seed a realistic season through the UI or a throwaway script (not committed): at least 8 players and 6 closed nights including a tie and a break-even night. Confirm standings order, the gray unranked list, the tie showing two winners, and the 390px layout. Screenshot. `npm run check-all && npm test` pass.
- [ ] **Step 4: Commit** — `git commit -m "Add the group standings and player pages" -m "Standings lead with who is up for the season and list everyone else unranked, and each player page shows their season with the full night-by-night history."`

### Task 8: Year-end recap

**Files:**
- Create: `src/app/(group)/recap/[year]/page.tsx`
- Modify: `src/app/(group)/page.tsx` (link "2026 recap" next to the season switcher for any specific year)

**Interfaces:**
- Consumes: `recap`, `nightsInSeason` (Task 2), `listClosedNights` (Task 5), `listPlayers` (Task 4).

- [ ] **Step 1: Page** — `/recap/2026`: title "2026 recap" (or "2026 so far" while the year is current), the standings block (same component as the group page — extract it to `src/app/(group)/standings-list.tsx` and reuse), award cards for most nights won, biggest night, longest up-streak (ties list every name; cards hidden when `null`), then one card per player (net via `formatNet`, nights played, nights won). Non-numeric or future years → 404. Layout fits a single phone screenshot per section at 390px.
- [ ] **Step 2: Verify in a browser** with the Task 7 seed data; screenshot desktop and 390px. `npm run check-all && npm test` pass.
- [ ] **Step 3: Commit** — `git commit -m "Add the year-end recap page" -m "Final standings, the season's awards, and a card per player, reusing the group page's standings so the ranking rule stays in one place."`

### Task 9: Owner settings

**Files:**
- Create: `src/groups/actions.ts`, `src/app/(group)/settings/page.tsx`, `src/app/(group)/settings/invite-link-card.tsx`, `src/app/(group)/settings/merge-players-form.tsx`

**Interfaces:**
- Consumes: `resetInviteCode`, `renameGroup` (Task 3), `mergePlayersAction`, `listPlayers` (Task 4), `requireOwner` (Task 3).
- Produces: `resetInviteAction(): Promise<{ joinUrl: string }>`, `renameGroupAction(formData: FormData)`.

- [ ] **Step 1: Page** — owner-only (`requireOwner`, 404 otherwise): the current join link with a Copy button and "Reset link" (confirm dialog: "Everyone using the old link loses edit access until they open the new one."); group name field; merge form ("Merge [from] into [into]") that shows the `same-night` dates when refused; sign-out button.
- [ ] **Step 2: Verify in a browser** — reset the link, confirm a member browser is now gated and the old URL lands on `/join/invalid`, the new URL works; merge two duplicate players and confirm their nights combine on the player page; try merging two players from the same night and see the dates. `npm run check-all && npm test` pass.
- [ ] **Step 3: Commit** — `git commit -m "Add owner settings for the link, group name, and merges" -m "The owner can copy or reset the group link, rename the group, and merge duplicate players from one page."`

### Task 10: Deploy to Railway

**Files:**
- Create: `Dockerfile`, `.dockerignore`, `.railway/railway.ts`
- Modify: `package.json` (devDependency `railway`), `README.md` (deploy + first-time setup)

**Interfaces:**
- Consumes: `scripts/migrate.mjs` (Task 1), `scripts/setup.ts` (Task 3), `/api/health` (Task 1).

- [ ] **Step 1: Dockerfile** — `node:24-alpine`; build stage `npm ci`, `npm run build`, `npm prune --omit=dev`; runtime stage copies `package.json`, `node_modules`, `.next`, `public`, `next.config.mjs`, `drizzle/`, `scripts/migrate.mjs`; `ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1`; `CMD ["sh", "-c", "node node_modules/next/dist/bin/next start -p ${PORT:-3410}"]`. Not the standalone output: the migrator needs `drizzle-orm`'s migrator module, which tracing would drop. Verify `docker build -t octagon-poker .` succeeds and `docker run` against the local database serves `/api/health`.
- [ ] **Step 2: Railway config** — `.railway/railway.ts` modeled on content-farm: `postgres('postgres')`, `github('Ethansev/octagon-poker', { branch: 'main' })`, one `service('web', …)` with `builder: 'DOCKERFILE'`, `deploy: { healthcheckPath: '/api/health', preDeployCommand: ['node scripts/migrate.mjs'] }`, env `DATABASE_URL: db.env.DATABASE_URL`, `BETTER_AUTH_SECRET: preserve()`, `BETTER_AUTH_URL: preserve()`.
- [ ] **Step 3: Deploy** — apply the Railway config, set `BETTER_AUTH_SECRET` (from `npx auth secret`) and `BETTER_AUTH_URL` (the Railway domain), wait for a healthy deploy, then run the setup script once against the Railway database's public URL (`DATABASE_URL=<public url> OWNER_EMAIL=… OWNER_PASSWORD=… npm run setup`) and record the printed join link for the owner.
- [ ] **Step 4: Verify the live site** — gate shows without the link; join link works; owner sign-in works; log one real night end to end; screenshot.
- [ ] **Step 5: Commit** — `git commit -m "Deploy to Railway with Postgres" -m "Adds the Dockerfile and Railway config; migrations run as the pre-deploy step and the health check gates each release."`

### Task 11: Prune unused UI and finish

**Files:**
- Delete: every `src/components/ui/*.tsx` not imported anywhere in `src/app` or by another kept UI component, `src/hooks/use-mobile.ts` if unused, `AGENTS.md` only if Next stops regenerating it (otherwise keep).
- Modify: `package.json` (remove the Radix, `cmdk`, `embla-carousel-react`, `input-otp`, `vaul`, `react-resizable-panels`, `next-themes`, `react-day-picker` packages that no kept component imports), `eslint.config.mjs` (drop the shadcn override lines if the files it covered are gone), `README.md`.
- Delete at the end: this plan file (`docs/superpowers/plans/2026-10-21-group-tracker.md`).

- [ ] **Step 1: Find unused components** — for each file in `src/components/ui`, `grep -rl "components/ui/<name>" src` excluding the file itself; delete those with no importers, repeat until stable.
- [ ] **Step 2: Remove orphaned packages** — `grep -rhoE "from ['\"][^'\".][^'\"]*['\"]" src` gives the imported package set; uninstall listed deps not in it.
- [ ] **Step 3: Verify** — `npm ci && npm run check-all && npm test && npm run build` pass; click through group, night, player, recap, settings pages once more and screenshot.
- [ ] **Step 4: Commit** — `git commit -m "Remove unused UI components and packages" -m "Drops the shadcn components and Radix packages the rebuilt app never imports, and deletes the finished implementation plan."`
