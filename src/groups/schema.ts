import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { user } from '@/auth/schema';

export const groups = pgTable('groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  inviteCode: text('invite_code').notNull().unique(),
  ownerUserId: text('owner_user_id').references(() => user.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Group = typeof groups.$inferSelect;
