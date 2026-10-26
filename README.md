# Octagon Poker

Private record book for one home-game group: nights, buy-ins, cash-outs, season standings.

## Getting started

```bash
cp .env.example .env
docker compose up -d --wait
npm ci
npm run db:migrate
```

Fill in `OWNER_EMAIL`, `OWNER_PASSWORD`, and `GROUP_NAME` in `.env`, then create the owner and group (idempotent) and print the join link:

```bash
npm run setup
npm run dev
```

`GROUP_TIME_ZONE` (IANA name, default `America/Los_Angeles`) decides what "today" and the current year mean and the time shown in activity logs.

The app runs on http://localhost:3410. Postgres listens on host port 15436.

`npm test` runs against `TEST_DATABASE_URL` (created by the compose init script).

## Deploy (Railway)

`.railway/railway.ts` declares the Postgres and `web` service; the `Dockerfile` builds the app, and each release runs `node dist/predeploy.mjs` (bundled from `scripts/predeploy.ts`) as the pre-deploy step and is gated on `/api/health`. The pre-deploy step runs migrations, then creates the owner and group when `OWNER_PASSWORD` is set. One-time manual steps:

1. Apply `.railway/railway.ts` ([Railway IaC docs](https://docs.railway.com)) for the `Ethansev/octagon-poker` repo, branch `main`.
2. Set `BETTER_AUTH_SECRET` (generate with `npx auth secret`) and `BETTER_AUTH_URL` (the service's Railway domain) on `web`.
3. Set `OWNER_EMAIL`, `OWNER_PASSWORD`, and `GROUP_NAME` on `web`. The next deploy's pre-deploy logs print the join link.
4. Delete `OWNER_PASSWORD` once you can sign in. Later deploys skip setup, and Settings shows the join link.

The `postgres` service keeps daily, weekly and monthly volume backups (`railway postgres pitr schedule list --service postgres`); restore one from the service's Backups tab. The schedule lives on Railway, not in `.railway/railway.ts`.
