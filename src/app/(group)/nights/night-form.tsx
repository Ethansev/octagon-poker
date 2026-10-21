'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { NightFormInvalid } from '@/nights/actions';
import { useActionState, useEffect } from 'react';

type NightFormResult =
  NightFormInvalid | { kind: 'saved' } | { kind: 'night-closed' } | { kind: 'not-found' };

type NightFormProps = {
  action: (formData: FormData) => Promise<NightFormResult>;
  nightId: string | null;
  defaults: { date: string; location: string; buyIn: string };
  submitLabel: string;
  onSaved?: () => void;
};

const fieldMessages = {
  date: 'Pick a valid date',
  location: 'Keep the location under 80 characters',
  buyIn: 'Enter an amount like 20 or 20.50',
};

export function NightForm({ action, nightId, defaults, submitLabel, onSaved }: NightFormProps) {
  const [result, submit, pending] = useActionState(
    (_previous: NightFormResult | null, formData: FormData) => action(formData),
    null,
  );

  useEffect(() => {
    if (result?.kind === 'saved') onSaved?.();
  }, [result, onSaved]);

  const invalidField = result?.kind === 'invalid' ? result.field : null;

  return (
    <form action={submit} className='space-y-4'>
      {nightId !== null && <input type='hidden' name='nightId' value={nightId} />}
      <div className='space-y-1.5'>
        <Label htmlFor='night-date'>Date</Label>
        <Input
          id='night-date'
          name='date'
          type='date'
          required
          defaultValue={defaults.date}
          aria-invalid={invalidField === 'date'}
        />
        {invalidField === 'date' && <p className='text-sm text-red-600'>{fieldMessages.date}</p>}
      </div>
      <div className='space-y-1.5'>
        <Label htmlFor='night-location'>Location (optional)</Label>
        <Input
          id='night-location'
          name='location'
          defaultValue={defaults.location}
          placeholder="Sid's"
          aria-invalid={invalidField === 'location'}
        />
        {invalidField === 'location' && (
          <p className='text-sm text-red-600'>{fieldMessages.location}</p>
        )}
      </div>
      <div className='space-y-1.5'>
        <Label htmlFor='night-buy-in'>Typical buy-in (optional)</Label>
        <Input
          id='night-buy-in'
          name='buyIn'
          inputMode='decimal'
          defaultValue={defaults.buyIn}
          placeholder='20'
          aria-invalid={invalidField === 'buyIn'}
        />
        {invalidField === 'buyIn' && <p className='text-sm text-red-600'>{fieldMessages.buyIn}</p>}
      </div>
      {result?.kind === 'night-closed' && (
        <p className='text-sm text-red-600'>This night is closed. Reopen it to edit.</p>
      )}
      {result?.kind === 'not-found' && <p className='text-sm text-red-600'>Night not found.</p>}
      <Button type='submit' disabled={pending}>
        {submitLabel}
      </Button>
    </form>
  );
}
