export function isRealDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function formatNightDate(value: string): string {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export type NightDateParts = { month: string; day: number; weekday: string };

export function nightDateParts(value: string): NightDateParts {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return {
    month: date.toLocaleDateString('en-US', { month: 'short' }),
    day,
    weekday: date.toLocaleDateString('en-US', { weekday: 'long' }),
  };
}

export function formatShortNightDate(value: string): string {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

const clockPattern = /^([01]\d|2[0-3]):([0-5]\d)(?::\d{2})?$/;

export function isRealTime(value: string): boolean {
  return clockPattern.test(value);
}

export function timeInputValue(startTime: string | null): string {
  return startTime === null ? '' : startTime.slice(0, 5);
}

export function formatNightTime(startTime: string): string {
  const match = clockPattern.exec(startTime);
  if (!match) return startTime;
  const hour = Number(match[1]);
  const period = hour < 12 ? 'am' : 'pm';
  const shown = hour % 12 === 0 ? 12 : hour % 12;
  return match[2] === '00' ? `${shown}${period}` : `${shown}:${match[2]}${period}`;
}

export function nightCountdown(date: string, today: string): string | null {
  const days = (Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000;
  if (days < 0) return null;
  if (days === 0) return 'Tonight';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}
