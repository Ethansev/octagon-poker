import { nightCalendarFile } from '@/nights/night-calendar';
import { describe, expect, it } from 'vitest';

const base = {
  id: 'night-1',
  date: '2026-11-21',
  startTime: '20:30:00',
  title: 'Poker night',
  place: '1420 Valencia St, San Francisco',
  url: 'https://poker.example.com/nights/night-1',
  now: new Date('2026-11-04T12:00:00.000Z'),
};

describe('nightCalendarFile', () => {
  it.each([
    {
      name: 'a timed night runs five hours and can cross midnight',
      night: base,
      lines: ['DTSTART:20261121T203000', 'DTEND:20261122T013000'],
    },
    {
      name: 'an early night stays on the same day',
      night: { ...base, startTime: '12:00:00' },
      lines: ['DTSTART:20261121T120000', 'DTEND:20261121T170000'],
    },
    {
      name: 'a night with no time is all day',
      night: { ...base, startTime: null },
      lines: ['DTSTART;VALUE=DATE:20261121', 'DTEND;VALUE=DATE:20261122'],
    },
    {
      name: 'commas and semicolons in text are escaped',
      night: { ...base, title: 'Poker; finally, again' },
      lines: ['SUMMARY:Poker\; finally\\, again', 'LOCATION:1420 Valencia St\\, San Francisco'],
    },
  ])('$name', ({ night, lines }) => {
    const file = nightCalendarFile(night).split('\r\n');
    for (const line of lines) expect(file).toContain(line);
  });

  it('leaves the location out when there isn’t one to share', () => {
    expect(nightCalendarFile({ ...base, place: null })).not.toContain('LOCATION');
  });
});
