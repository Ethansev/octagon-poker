import {
  formatNightDate,
  formatNightTime,
  formatShortNightDate,
  isRealDate,
  isRealTime,
  nightCountdown,
  nightDateParts,
  timeInputValue,
} from '@/nights/dates';
import { describe, expect, it } from 'vitest';

describe('isRealDate', () => {
  it.each([
    { name: 'a normal date is real', value: '2026-10-17', real: true },
    { name: 'Feb 31 does not exist', value: '2026-02-31', real: false },
    { name: 'leap day in a leap year is real', value: '2028-02-29', real: true },
    { name: 'free text is rejected', value: 'yesterday', real: false },
  ])('$name', ({ value, real }) => {
    expect(isRealDate(value)).toBe(real);
  });
});

describe('date formatting', () => {
  it('formats a night date without timezone drift', () => {
    expect(formatNightDate('2026-10-17')).toBe('Sat, Oct 17, 2026');
  });
});

describe('nightDateParts', () => {
  it.each([
    {
      name: 'splits a night into its calendar tile parts',
      value: '2026-10-17',
      expected: { month: 'Oct', day: 17, weekday: 'Saturday' },
    },
    {
      name: 'the first of the year stays in January',
      value: '2026-01-01',
      expected: { month: 'Jan', day: 1, weekday: 'Thursday' },
    },
  ])('$name', ({ value, expected }) => {
    expect(nightDateParts(value)).toEqual(expected);
  });
});

describe('formatShortNightDate', () => {
  it('drops the year', () => {
    expect(formatShortNightDate('2026-03-07')).toBe('Sat, Mar 7');
  });
});

describe('formatNightTime', () => {
  it.each([
    { name: 'on the hour drops the minutes', value: '20:00:00', expected: '8pm' },
    { name: 'past the hour keeps them', value: '20:30', expected: '8:30pm' },
    { name: 'midnight is 12am', value: '00:00:00', expected: '12am' },
    { name: 'noon is 12pm', value: '12:00:00', expected: '12pm' },
    { name: 'the morning stays am', value: '09:05:00', expected: '9:05am' },
  ])('$name', ({ value, expected }) => {
    expect(formatNightTime(value)).toBe(expected);
  });
});

describe('isRealTime', () => {
  it.each([
    { name: 'what a time input sends', value: '20:30', real: true },
    { name: 'what the database returns', value: '20:30:00', real: true },
    { name: 'an hour past the end of the day', value: '24:00', real: false },
    { name: 'free text', value: 'eightish', real: false },
  ])('$name', ({ value, real }) => {
    expect(isRealTime(value)).toBe(real);
  });
});

describe('timeInputValue', () => {
  it.each([
    { name: 'no start time leaves the field blank', value: null, expected: '' },
    { name: 'the seconds are dropped', value: '20:30:00', expected: '20:30' },
  ])('$name', ({ value, expected }) => {
    expect(timeInputValue(value)).toBe(expected);
  });
});

describe('nightCountdown', () => {
  it.each([
    { name: 'the same day', date: '2026-11-21', expected: 'Tonight' },
    { name: 'the next day', date: '2026-11-22', expected: 'Tomorrow' },
    { name: 'across a daylight saving change', date: '2026-11-30', expected: 'In 9 days' },
    { name: 'a night already past', date: '2026-11-20', expected: null },
  ])('$name', ({ date, expected }) => {
    expect(nightCountdown(date, '2026-11-21')).toBe(expected);
  });
});
