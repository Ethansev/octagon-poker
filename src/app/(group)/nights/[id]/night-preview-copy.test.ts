import { nightPreviewCopy, type PreviewNight } from '@/app/(group)/nights/[id]/night-preview-copy';
import { describe, expect, it } from 'vitest';

const ivy = { playerId: 'ivy', playerName: 'Ivy Chen', buyInCents: 20000 };
const sid = { playerId: 'sid', playerName: 'Sid Rao', buyInCents: 20000 };
const openNight: PreviewNight = {
  date: '2026-10-17',
  location: 'Sid’s',
  buyInCents: 20000,
  status: 'open',
  winners: [],
  seats: [ivy, sid],
};

function closedNight(changes: Partial<PreviewNight>): PreviewNight {
  return { ...openNight, status: 'closed', ...changes };
}

describe('nightPreviewCopy', () => {
  it.each([
    {
      name: 'an open night reads as the invite with no amounts won or lost',
      night: openNight,
      title: 'Poker night · Sat, Oct 17 at Sid’s',
      description: '$200 buy-in · 2 players so far',
    },
    {
      name: 'an open night with nothing filled in still invites',
      night: { ...openNight, location: null, buyInCents: null, seats: [] },
      title: 'Poker night · Sat, Oct 17',
      description: 'You’re invited',
    },
    {
      name: 'a closed night names one winner by first name',
      night: closedNight({ winners: ['ivy'] }),
      title: 'Ivy takes it! · Octagon Poker',
      description: '$400 pot · 2 players',
    },
    {
      name: 'a closed night with a tie names both',
      night: closedNight({ winners: ['ivy', 'sid'] }),
      title: 'Ivy and Sid split it! · Octagon Poker',
      description: '$400 pot · 2 players',
    },
    {
      name: 'a closed night where nobody came out ahead says so',
      night: closedNight({ winners: [], seats: [ivy] }),
      title: 'Everybody broke even · Octagon Poker',
      description: '$200 pot · 1 player',
    },
  ])('$name', ({ night, title, description }) => {
    expect(nightPreviewCopy(night)).toEqual({ title, description });
  });
});
