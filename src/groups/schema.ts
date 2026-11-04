import { user } from '@/auth/schema';
import { players } from '@/players/schema';
import { pgTable, text, timestamp, uuid, type AnyPgColumn } from 'drizzle-orm/pg-core';

export const groups = pgTable('groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  inviteCode: text('invite_code').notNull().unique(),
  ownerUserId: text('owner_user_id').references(() => user.id),
  ownerPlayerId: uuid('owner_player_id').references((): AnyPgColumn => players.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Group = typeof groups.$inferSelect;
