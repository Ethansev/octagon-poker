'use client';

import { NightForm } from '@/app/(group)/nights/night-form';
import { createNightAction } from '@/nights/actions';

export function NewNightForm({ today }: { today: string }) {
  return (
    <NightForm
      action={createNightAction}
      nightId={null}
      defaults={{ date: today, location: '', buyIn: '' }}
      submitLabel='Create night'
    />
  );
}
