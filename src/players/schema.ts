import { groups } from '@/groups/schema';
import { sql } from 'drizzle-orm';
import {
  check,
  customType,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

const jpegBytes = customType<{ data: Buffer }>({ dataType: () => 'bytea' });

export const players = pgTable(
  'players',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    groupId: uuid('group_id')
      .notNull()
      .references(() => groups.id),
    name: text('name').notNull(),
    colorSlot: integer('color_slot').notNull(),
    venmoHandle: text('venmo_handle'),
    zelleHandle: text('zelle_handle'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('players_group_id_lower_name_idx').on(t.groupId, sql`lower(${t.name})`),
    check('players_color_slot_range', sql`${t.colorSlot} between 0 and 15`),
  ],
);

export const playerPhotos = pgTable('player_photos', {
  playerId: uuid('player_id')
    .primaryKey()
    .references(() => players.id, { onDelete: 'cascade' }),
  jpeg: jpegBytes('jpeg').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
