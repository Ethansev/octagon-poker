import type { NightPhase } from '@/nights/night-phase';

export type NightView = 'invite' | 'table';

export function nightView(
  requested: string | string[] | undefined,
  role: 'owner' | 'member',
  phase: NightPhase,
): NightView {
  if (requested === 'invite' || requested === 'table') return requested;
  return role === 'member' && phase === 'upcoming' ? 'invite' : 'table';
}
