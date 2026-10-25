import type { SeasonScope } from '@/app/(group)/seasons';

export function seasonKicker(scope: SeasonScope): string {
  return scope.kind === 'all' ? 'All time' : `Season ${scope.year}`;
}

export function seasonGreeting(scope: SeasonScope): string {
  if (scope.kind === 'current') return 'Hey crew, here’s the latest';
  if (scope.kind === 'past') return `Hey crew, here’s how ${scope.year} went`;
  return 'Hey crew, here’s the whole run';
}

export function seasonPrefix(scope: SeasonScope): string {
  return scope.kind === 'all' ? 'All-time' : String(scope.year);
}

export function seasonSpan(scope: SeasonScope): string {
  if (scope.kind === 'current') return 'this year';
  if (scope.kind === 'past') return `in ${scope.year}`;
  return 'ever';
}
