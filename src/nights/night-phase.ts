import { clockInGroup, dateInGroup } from '@/dates/group-time';
import { timeInputValue } from '@/nights/dates';

export type NightPhase = 'upcoming' | 'live' | 'closed';

export function nightPhase(
  night: { date: string; startTime: string | null; status: 'open' | 'closed' },
  now: Date,
  zone?: string,
): NightPhase {
  if (night.status === 'closed') return 'closed';
  const today = dateInGroup(now, zone);
  if (night.date > today) return 'upcoming';
  if (night.date < today) return 'live';
  return clockInGroup(now, zone) < timeInputValue(night.startTime) ? 'upcoming' : 'live';
}
