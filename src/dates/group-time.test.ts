import { clockInGroup, dateInGroup, timeInGroup, yearInGroup } from '@/dates/group-time';
import { describe, expect, it } from 'vitest';

const LA = 'America/Los_Angeles';

describe('dateInGroup', () => {
  it.each([
    {
      name: 'just after UTC new year is still the previous evening in Los Angeles',
      instant: '2027-01-01T05:30:00Z',
      zone: LA,
      expected: '2026-12-31',
    },
    {
      name: 'the same instant is already the new year in UTC',
      instant: '2027-01-01T05:30:00Z',
      zone: 'UTC',
      expected: '2027-01-01',
    },
    {
      name: 'summer time shifts by seven hours',
      instant: '2026-07-04T06:59:00Z',
      zone: LA,
      expected: '2026-07-03',
    },
  ])('$name', ({ instant, zone, expected }) => {
    expect(dateInGroup(new Date(instant), zone)).toBe(expected);
  });
});

describe('yearInGroup', () => {
  it.each([
    {
      name: 'the year rolls over later in Los Angeles',
      instant: '2027-01-01T05:30:00Z',
      zone: LA,
      expected: 2026,
    },
    {
      name: 'the year rolls over on time in UTC',
      instant: '2027-01-01T05:30:00Z',
      zone: 'UTC',
      expected: 2027,
    },
  ])('$name', ({ instant, zone, expected }) => {
    expect(yearInGroup(new Date(instant), zone)).toBe(expected);
  });
});

describe('timeInGroup', () => {
  it.each([
    {
      name: 'evening time uses a lowercase pm',
      instant: '2027-01-01T05:30:00Z',
      zone: LA,
      expected: '9:30pm',
    },
    {
      name: 'morning time uses a lowercase am',
      instant: '2026-10-17T16:05:00Z',
      zone: LA,
      expected: '9:05am',
    },
    {
      name: 'midnight reads as 12am',
      instant: '2026-10-17T07:00:00Z',
      zone: LA,
      expected: '12:00am',
    },
  ])('$name', ({ instant, zone, expected }) => {
    expect(timeInGroup(new Date(instant), zone)).toBe(expected);
  });
});

describe('clockInGroup', () => {
  it.each([
    {
      name: 'an evening in Los Angeles reads on a 24-hour clock',
      instant: '2026-10-18T03:30:00Z',
      zone: LA,
      expected: '20:30',
    },
    {
      name: 'midnight reads as 00, not 24',
      instant: '2026-10-18T07:00:00Z',
      zone: LA,
      expected: '00:00',
    },
    {
      name: 'the same instant reads differently in another zone',
      instant: '2026-10-18T03:30:00Z',
      zone: 'UTC',
      expected: '03:30',
    },
  ])('$name', ({ instant, zone, expected }) => {
    expect(clockInGroup(new Date(instant), zone)).toBe(expected);
  });
});
