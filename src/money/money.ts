export type ParsedDollars = { kind: 'empty' } | { kind: 'amount'; cents: number } | { kind: 'invalid' };

const MAX_CENTS = 10_000_000;

const DOLLARS_PATTERN = /^\$?(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{0,2}))?$/;

const wholeFormat = new Intl.NumberFormat('en-US');
const centsFormat = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function parseDollars(input: string): ParsedDollars {
  const trimmed = input.trim();
  if (trimmed === '') return { kind: 'empty' };
  const match = DOLLARS_PATTERN.exec(trimmed);
  if (!match) return { kind: 'invalid' };
  const dollars = Number(match[1].replaceAll(',', ''));
  const fraction = (match[2] ?? '').padEnd(2, '0');
  const cents = dollars * 100 + Number(fraction);
  if (cents > MAX_CENTS) return { kind: 'invalid' };
  return { kind: 'amount', cents };
}

export function formatDollars(cents: number): string {
  const dollars = cents / 100;
  return `$${cents % 100 === 0 ? wholeFormat.format(dollars) : centsFormat.format(dollars)}`;
}

export function formatNet(cents: number): string {
  if (cents > 0) return `+${formatDollars(cents)}`;
  if (cents < 0) return `−${formatDollars(-cents)}`;
  return formatDollars(0);
}
