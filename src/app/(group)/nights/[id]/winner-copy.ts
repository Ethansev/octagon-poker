import { joinNames } from '@/nights/names';
import { firstName } from '@/players/first-name';

export function ordinal(n: number): string {
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

export function winnerKicker(winnerCount: number): string {
  if (winnerCount === 0) return 'No winner tonight';
  if (winnerCount === 1) return 'Winner winner';
  return 'Split at the top';
}

export function winnerHeadline(names: string[]): string {
  if (names.length === 0) return 'Everybody broke even';
  if (names.length === 1) return `${names[0]} takes it!`;
  return `${joinNames(names.map(firstName))} split it!`;
}

export function winLabel(name: string, winNumber: number, year: number, shared: boolean): string {
  const whose = shared ? `${firstName(name)}’s ` : '';
  return `${whose}${ordinal(winNumber)} win of ${year}`;
}
