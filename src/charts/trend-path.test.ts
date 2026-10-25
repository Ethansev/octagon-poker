import { trendGeometry } from '@/charts/trend-path';
import { describe, expect, it } from 'vitest';

describe('trendGeometry', () => {
  it.each([
    { name: 'no nights draws nothing', nets: [], expected: null },
    {
      name: 'one winning night climbs from the zero line to the top corner',
      nets: [500],
      expected: {
        points: [
          { x: 0, y: 100, total: 0 },
          { x: 100, y: 0, total: 500 },
        ],
        line: 'M0 100 L100 0',
        area: 'M0 100 L100 0 L100 100 L0 100 Z',
        zeroY: 100,
        high: 500,
        low: 0,
      },
    },
    {
      name: 'a dip below zero lifts the zero line off the floor',
      nets: [-100, 300],
      expected: {
        points: [
          { x: 0, y: 66.67, total: 0 },
          { x: 50, y: 100, total: -100 },
          { x: 100, y: 0, total: 200 },
        ],
        line: 'M0 66.67 L50 100 L100 0',
        area: 'M0 66.67 L50 100 L100 0 L100 66.67 L0 66.67 Z',
        zeroY: 66.67,
        high: 200,
        low: -100,
      },
    },
    {
      name: 'a dead even night stays flat through the middle',
      nets: [0],
      expected: {
        points: [
          { x: 0, y: 50, total: 0 },
          { x: 100, y: 50, total: 0 },
        ],
        line: 'M0 50 L100 50',
        area: 'M0 50 L100 50 L100 50 L0 50 Z',
        zeroY: 50,
        high: 0,
        low: 0,
      },
    },
  ])('$name', ({ nets, expected }) => {
    expect(trendGeometry(nets)).toEqual(expected);
  });
});
