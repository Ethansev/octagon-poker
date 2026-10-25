import type { HomeSeason } from '@/app/(group)/_home/load-home';
import {
  seasonGreeting,
  seasonKicker,
  seasonPrefix,
  seasonSpan,
} from '@/app/(group)/_home/season-copy';
import { describe, expect, it } from 'vitest';

const rows: {
  name: string;
  scope: HomeSeason;
  kicker: string;
  greeting: string;
  prefix: string;
  span: string;
}[] = [
  {
    name: 'the current season is the latest',
    scope: { kind: 'current', year: 2026 },
    kicker: 'Season 2026',
    greeting: 'Hey crew, here’s the latest',
    prefix: '2026',
    span: 'this year',
  },
  {
    name: 'a past season looks back',
    scope: { kind: 'past', year: 2025 },
    kicker: 'Season 2025',
    greeting: 'Hey crew, here’s how 2025 went',
    prefix: '2025',
    span: 'in 2025',
  },
  {
    name: 'all time covers the whole run',
    scope: { kind: 'all' },
    kicker: 'All time',
    greeting: 'Hey crew, here’s the whole run',
    prefix: 'All-time',
    span: 'ever',
  },
];

describe('season copy', () => {
  it.each(rows)('$name', ({ scope, kicker, greeting, prefix, span }) => {
    expect({
      kicker: seasonKicker(scope),
      greeting: seasonGreeting(scope),
      prefix: seasonPrefix(scope),
      span: seasonSpan(scope),
    }).toEqual({ kicker, greeting, prefix, span });
  });
});
