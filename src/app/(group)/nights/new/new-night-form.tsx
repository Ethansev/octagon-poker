'use client';

import { NightForm } from '@/app/(group)/nights/night-form';
import { createNightAction } from '@/nights/actions';
import type { NightPicks } from '@/nights/night-hints';

export function NewNightForm({
  defaults,
  picks,
}: {
  defaults: { date: string; location: string; buyIn: string };
  picks: NightPicks;
}) {
  return (
    <NightForm
      action={createNightAction}
      nightId={null}
      defaults={defaults}
      picks={picks}
      submitLabel='Deal the night'
      pendingLabel='Dealing…'
    />
  );
}
