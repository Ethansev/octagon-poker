import { nightPhase } from '@/nights/night-phase';
import { describe, expect, it } from 'vitest';

const LA = 'America/Los_Angeles';
const eightPmOct17InLa = new Date('2026-10-18T03:00:00Z');

describe('nightPhase', () => {
  it.each([
    {
      name: 'a closed night stays closed even if its date is ahead',
      night: { date: '2026-12-01', startTime: '20:00:00', status: 'closed' },
      expected: 'closed',
    },
    {
      name: 'a later date is upcoming',
      night: { date: '2026-10-18', startTime: null, status: 'open' },
      expected: 'upcoming',
    },
    {
      name: 'an earlier date is live',
      night: { date: '2026-10-16', startTime: '23:00:00', status: 'open' },
      expected: 'live',
    },
    {
      name: 'today with no start time is live by the evening',
      night: { date: '2026-10-17', startTime: null, status: 'open' },
      expected: 'live',
    },
    {
      name: 'a minute before the start is upcoming',
      night: { date: '2026-10-17', startTime: '20:01:00', status: 'open' },
      expected: 'upcoming',
    },
    {
      name: 'the moment it starts is live',
      night: { date: '2026-10-17', startTime: '20:00:00', status: 'open' },
      expected: 'live',
    },
  ] satisfies {
    name: string;
    night: { date: string; startTime: string | null; status: 'open' | 'closed' };
    expected: string;
  }[])('$name', ({ night, expected }) => {
    expect(nightPhase(night, eightPmOct17InLa, LA)).toBe(expected);
  });

  it('today with no start time waits for the evening', () => {
    const night: { date: string; startTime: null; status: 'open' } = {
      date: '2026-10-17',
      startTime: null,
      status: 'open',
    };
    expect(nightPhase(night, new Date('2026-10-17T15:00:00Z'), LA)).toBe('upcoming');
    expect(nightPhase(night, new Date('2026-10-18T01:00:00Z'), LA)).toBe('live');
  });

  it('judges the date in the group’s zone, not UTC', () => {
    const night: { date: string; startTime: string; status: 'open' } = {
      date: '2026-10-17',
      startTime: '21:00:00',
      status: 'open',
    };
    expect(nightPhase(night, eightPmOct17InLa, LA)).toBe('upcoming');
    expect(nightPhase(night, eightPmOct17InLa, 'UTC')).toBe('live');
  });
});
