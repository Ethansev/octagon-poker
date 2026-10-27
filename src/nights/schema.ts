import { groups } from '@/groups/schema';
import { players } from '@/players/schema';
import { sql } from 'drizzle-orm';
import {
  check,
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

export const nightStatus = pgEnum('night_status', ['open', 'closed']);
export const actorKind = pgEnum('actor_kind', ['owner', 'member']);

export const nights = pgTable('nights', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupId: uuid('group_id')
    .notNull()
    .references(() => groups.id),
  date: date('date', { mode: 'string' }).notNull(),
  location: text('location'),
  buyInCents: integer('buy_in_cents'),
  status: nightStatus('status').notNull().default('open'),
  bankPlayerId: uuid('bank_player_id').references(() => players.id, { onDelete: 'set null' }),
  closedAt: timestamp('closed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const seats = pgTable(
  'seats',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    nightId: uuid('night_id')
      .notNull()
      .references(() => nights.id, { onDelete: 'cascade' }),
    playerId: uuid('player_id')
      .notNull()
      .references(() => players.id),
    buyInCents: integer('buy_in_cents').notNull().default(0),
    cashOutCents: integer('cash_out_cents'),
    paidOutAt: timestamp('paid_out_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique('seats_night_id_player_id_unique').on(t.nightId, t.playerId),
    check('seats_buy_in_cents_nonneg', sql`${t.buyInCents} >= 0`),
    check('seats_cash_out_cents_nonneg', sql`${t.cashOutCents} >= 0`),
  ],
);

export const nightEvents = pgTable('night_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  nightId: uuid('night_id')
    .notNull()
    .references(() => nights.id, { onDelete: 'cascade' }),
  actorKind: actorKind('actor_kind').notNull(),
  actorPlayerId: uuid('actor_player_id').references(() => players.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  detail: jsonb('detail').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
