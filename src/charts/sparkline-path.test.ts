import { sparklineGeometry } from '@/charts/sparkline-path';
import { describe, expect, it } from 'vitest';

describe('sparklineGeometry', () => {
  it.each([
    { name: 'no nights draws nothing', nets: [], expected: null },
    { name: 'a single night draws nothing', nets: [500], expected: null },
    {
      name: 'a climb runs from the zero line up to the top right',
      nets: [100, 100],
      expected: { path: 'M4.0 36.0 L54.0 20.0 L104.0 4.0', zeroY: 36, end: { x: 104, y: 4 } },
    },
    {
      name: 'a dip below zero keeps the zero line in the middle',
      nets: [-100, 200],
      expected: { path: 'M4.0 20.0 L54.0 36.0 L104.0 4.0', zeroY: 20, end: { x: 104, y: 4 } },
    },
  ])('$name', ({ nets, expected }) => {
    expect(sparklineGeometry(nets, 108, 40)).toEqual(expected);
  });
});
