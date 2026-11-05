import { clockInGroup, dateInGroup } from '@/dates/group-time';
import { timeInputValue } from '@/nights/dates';

export type NightPhase = 'upcoming' | 'live' | 'closed';

const ASSUMED_START = '18:00';

export function nightPhase(
  night: { date: string; startTime: string | null; status: 'open' | 'closed' },
  now: Date,
  zone?: string,
): NightPhase {
  if (night.status === 'closed') return 'closed';
  const today = dateInGroup(now, zone);
  if (night.date > today) return 'upcoming';
  if (night.date < today) return 'live';
  const startsAt = night.startTime === null ? ASSUMED_START : timeInputValue(night.startTime);
  return clockInGroup(now, zone) < startsAt ? 'upcoming' : 'live';
}
