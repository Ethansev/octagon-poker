import { feedLine } from '@/app/(group)/nights/[id]/feed-lines';
import type { NightEventView } from '@/nights/nights';
import { describe, expect, it } from 'vitest';

const names = new Map([
  ['ivy', 'Ivy'],
  ['sid', 'Sid'],
]);

function event(overrides: Partial<NightEventView>): NightEventView {
  return {
    id: 'e1',
    actorKind: 'owner',
    actorName: null,
    action: 'night.create',
    detail: {},
    createdAt: new Date('2026-10-21T02:00:00Z'),
    ...overrides,
  };
}

const seatUpdate = (
  before: { buyInCents: number; cashOutCents: number | null },
  after: { buyInCents: number; cashOutCents: number | null },
) => event({ action: 'seat.update', detail: { playerId: 'ivy', before, after } });

describe('feedLine', () => {
  it.each([
    {
      name: 'the host starting the night',
      input: event({}),
      expected: { kind: 'night', mark: 'start', text: 'The host started the night' },
    },
    {
      name: 'the host closing the books',
      input: event({ action: 'night.close' }),
      expected: { kind: 'night', mark: 'close', text: 'The host closed the books' },
    },
    {
      name: 'a player sitting down',
      input: event({
        action: 'seat.add',
        detail: { playerId: 'ivy', before: null, after: { buyInCents: 2000, cashOutCents: null } },
      }),
      expected: { kind: 'seat', playerId: 'ivy', text: 'Ivy sat down with $20', by: 'the host' },
    },
    {
      name: 'a first cash-out',
      input: seatUpdate(
        { buyInCents: 2000, cashOutCents: null },
        { buyInCents: 2000, cashOutCents: 3500 },
      ),
      expected: { kind: 'seat', playerId: 'ivy', text: 'Ivy cashed out $35', by: 'the host' },
    },
    {
      name: 'a cash-out being corrected',
      input: seatUpdate(
        { buyInCents: 2000, cashOutCents: 3500 },
        { buyInCents: 2000, cashOutCents: 3000 },
      ),
      expected: {
        kind: 'seat',
        playerId: 'ivy',
        text: "Ivy's cash-out changed: $35 → $30",
        by: 'the host',
      },
    },
    {
      name: 'a rebuy',
      input: seatUpdate(
        { buyInCents: 2000, cashOutCents: null },
        { buyInCents: 4000, cashOutCents: null },
      ),
      expected: {
        kind: 'seat',
        playerId: 'ivy',
        text: 'Ivy rebought, now in for $40',
        by: 'the host',
      },
    },
    {
      name: 'a buy-in being lowered',
      input: seatUpdate(
        { buyInCents: 4000, cashOutCents: null },
        { buyInCents: 2000, cashOutCents: null },
      ),
      expected: {
        kind: 'seat',
        playerId: 'ivy',
        text: "Ivy's buy-in changed: $40 → $20",
        by: 'the host',
      },
    },
    {
      name: 'a cash-out being cleared',
      input: seatUpdate(
        { buyInCents: 2000, cashOutCents: 0 },
        { buyInCents: 2000, cashOutCents: null },
      ),
      expected: { kind: 'seat', playerId: 'ivy', text: 'Ivy is back at the table', by: 'the host' },
    },
    {
      name: 'both numbers changing at once',
      input: seatUpdate(
        { buyInCents: 2000, cashOutCents: null },
        { buyInCents: 4000, cashOutCents: 6000 },
      ),
      expected: {
        kind: 'seat',
        playerId: 'ivy',
        text: 'Ivy is now $40 in, $60 out',
        by: 'the host',
      },
    },
    {
      name: 'a player entering their own numbers',
      input: event({
        actorKind: 'member',
        actorName: 'Ivy',
        action: 'seat.update',
        detail: {
          playerId: 'ivy',
          before: { buyInCents: 2000, cashOutCents: null },
          after: { buyInCents: 2000, cashOutCents: 0 },
        },
      }),
      expected: { kind: 'seat', playerId: 'ivy', text: 'Ivy cashed out $0', by: null },
    },
    {
      name: 'a friend entering someone else’s numbers',
      input: event({
        actorKind: 'member',
        actorName: 'Sid',
        action: 'seat.remove',
        detail: { playerId: 'ivy', before: { buyInCents: 2000, cashOutCents: null }, after: null },
      }),
      expected: { kind: 'seat', playerId: 'ivy', text: 'Ivy left the table', by: 'Sid' },
    },
    {
      name: 'an event with an unreadable detail',
      input: event({ action: 'seat.update', detail: { nope: true } }),
      expected: { kind: 'night', mark: 'other', text: 'The host made a change' },
    },
  ])('$name', ({ input, expected }) => {
    expect(feedLine(input, names)).toEqual(expected);
  });
});
