# Octagon Poker

Private record book for one home-game group: nights, buy-ins, cash-outs, season standings.

## Getting started

```bash
cp .env.example .env
docker compose up -d --wait
npm ci
npm run db:migrate
npm run dev
```

The app runs on http://localhost:3410. Postgres listens on host port 15436.

`npm test` runs against `TEST_DATABASE_URL` (created by the compose init script).

## Deploy (Railway)

`.railway/railway.ts` declares the Postgres and `web` service; the `Dockerfile` builds the app, and each release runs `node scripts/migrate.mjs` as the pre-deploy step and is gated on `/api/health`. One-time manual steps:

1. Apply `.railway/railway.ts` ([Railway IaC docs](https://docs.railway.com)) for the `Ethansev/octagon-poker` repo, branch `main`.
2. Set `BETTER_AUTH_SECRET` (generate with `npx auth secret`) and `BETTER_AUTH_URL` (the service's Railway domain).
3. Once the deploy is healthy, create the owner and group by running setup against the Railway Postgres public URL:

   ```bash
   DATABASE_URL=<public url> OWNER_EMAIL=… OWNER_PASSWORD=… npm run setup
   ```

4. Share the join link it prints with the group.
