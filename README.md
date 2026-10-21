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
