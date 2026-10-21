import { env } from '@/env';

function partsOf(date: Date, zone: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en-US', { timeZone: zone, ...options }).formatToParts(date);
}

function part(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): string {
  return parts.find((p) => p.type === type)?.value ?? '';
}

export function dateInGroup(date: Date, zone: string = env.GROUP_TIME_ZONE): string {
  const parts = partsOf(date, zone, { year: 'numeric', month: '2-digit', day: '2-digit' });
  return `${part(parts, 'year')}-${part(parts, 'month')}-${part(parts, 'day')}`;
}

export function yearInGroup(date: Date, zone: string = env.GROUP_TIME_ZONE): number {
  return Number(dateInGroup(date, zone).slice(0, 4));
}

export function timeInGroup(date: Date, zone: string = env.GROUP_TIME_ZONE): string {
  const parts = partsOf(date, zone, { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${part(parts, 'hour')}:${part(parts, 'minute')}${part(parts, 'dayPeriod').toLowerCase()}`;
}

export function todayInGroup(): string {
  return dateInGroup(new Date());
}

export function currentYearInGroup(): number {
  return yearInGroup(new Date());
}
