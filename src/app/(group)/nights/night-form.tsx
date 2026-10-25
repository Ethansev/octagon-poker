'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { centsToInput, formatDollars, parseDollars } from '@/money/money';
import type { NightFormInvalid } from '@/nights/actions';
import type { NightPicks } from '@/nights/night-hints';
import { CircleAlert } from 'lucide-react';
import { useActionState, useEffect, useId, useState } from 'react';

type NightFormResult =
  NightFormInvalid | { kind: 'saved' } | { kind: 'night-closed' } | { kind: 'not-found' };

type NightFields = { date: string; location: string; buyIn: string };

type NightFormProps = {
  action: (formData: FormData) => Promise<NightFormResult>;
  nightId: string | null;
  defaults: NightFields;
  picks: NightPicks;
  submitLabel: string;
  pendingLabel: string;
  onSaved?: () => void;
};

const fieldMessages = {
  date: 'Pick a valid date',
  location: 'Keep the location under 80 characters',
  buyIn: 'Enter an amount like 20 or 20.50',
};

function useNightFields(defaults: NightFields) {
  const [fields, setFields] = useState(defaults);
  const set = (name: keyof NightFields) => (value: string) =>
    setFields((current) => ({ ...current, [name]: value }));
  const parsedBuyIn = parseDollars(fields.buyIn);
  return {
    fields,
    setDate: set('date'),
    setLocation: set('location'),
    setBuyIn: set('buyIn'),
    buyInCents: parsedBuyIn.kind === 'amount' ? parsedBuyIn.cents : null,
  };
}

function useNightSubmit(action: NightFormProps['action'], onSaved: (() => void) | undefined) {
  const [result, submit, pending] = useActionState(
    (_previous: NightFormResult | null, formData: FormData) => action(formData),
    null,
  );

  useEffect(() => {
    if (result?.kind === 'saved') onSaved?.();
  }, [result, onSaved]);

  return {
    result,
    submit,
    pending,
    invalidField: result?.kind === 'invalid' ? result.field : null,
  };
}

function FieldError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className='flex items-center gap-1.5 text-sm font-semibold text-error'>
      <CircleAlert aria-hidden className='size-4 shrink-0' />
      {children}
    </p>
  );
}

function OptionalTag() {
  return <span className='text-xs font-bold text-ink-3'>Optional</span>;
}

function QuickPicks({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role='group' aria-label={label} className='flex flex-wrap gap-2'>
      {children}
    </div>
  );
}

function QuickPick({
  selected,
  onPick,
  children,
}: {
  selected: boolean;
  onPick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type='button'
      aria-pressed={selected}
      onClick={onPick}
      className={cn(
        'inline-flex h-9 max-w-full items-center truncate rounded-full border px-3.5 text-sm font-bold tabular-nums transition focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none motion-reduce:transition-none',
        selected
          ? 'border-ink bg-ink text-bg'
          : 'border-line bg-surface text-ink-2 hover:border-ink-3 hover:text-ink',
      )}>
      {children}
    </button>
  );
}

export function NightForm({
  action,
  nightId,
  defaults,
  picks,
  submitLabel,
  pendingLabel,
  onSaved,
}: NightFormProps) {
  const id = useId();
  const { fields, setDate, setLocation, setBuyIn, buyInCents } = useNightFields(defaults);
  const { result, submit, pending, invalidField } = useNightSubmit(action, onSaved);
  const errorId = (field: keyof NightFields) => `${id}-${field}-error`;

  return (
    <form action={submit} className='flex flex-col gap-6'>
      {nightId !== null && <input type='hidden' name='nightId' value={nightId} />}

      <div className='flex flex-col gap-2.5'>
        <Label htmlFor={`${id}-date`}>When</Label>
        <Input
          id={`${id}-date`}
          name='date'
          type='date'
          required
          value={fields.date}
          onChange={(event) => setDate(event.target.value)}
          aria-invalid={invalidField === 'date'}
          aria-describedby={invalidField === 'date' ? errorId('date') : undefined}
          className='sm:max-w-60'
        />
        {invalidField === 'date' && (
          <FieldError id={errorId('date')}>{fieldMessages.date}</FieldError>
        )}
      </div>

      <div className='flex flex-col gap-2.5'>
        <Label htmlFor={`${id}-location`}>
          Where <OptionalTag />
        </Label>
        <Input
          id={`${id}-location`}
          name='location'
          value={fields.location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="Sid's place"
          autoComplete='off'
          aria-invalid={invalidField === 'location'}
          aria-describedby={invalidField === 'location' ? errorId('location') : undefined}
        />
        {invalidField === 'location' && (
          <FieldError id={errorId('location')}>{fieldMessages.location}</FieldError>
        )}
        {picks.locations.length > 0 && (
          <QuickPicks label='Past spots'>
            {picks.locations.map((location) => (
              <QuickPick
                key={location}
                selected={
                  fields.location.trim().toLocaleLowerCase() === location.toLocaleLowerCase()
                }
                onPick={() => setLocation(location)}>
                {location}
              </QuickPick>
            ))}
          </QuickPicks>
        )}
      </div>

      <div className='flex flex-col gap-2.5'>
        <Label htmlFor={`${id}-buy-in`}>
          Typical buy-in <OptionalTag />
        </Label>
        <div className='relative sm:max-w-60'>
          <span
            aria-hidden
            className='pointer-events-none absolute inset-y-0 left-4 grid place-items-center text-base font-bold text-ink-3 md:text-sm'>
            $
          </span>
          <Input
            id={`${id}-buy-in`}
            name='buyIn'
            inputMode='decimal'
            value={fields.buyIn}
            onChange={(event) => setBuyIn(event.target.value)}
            placeholder='20'
            autoComplete='off'
            aria-invalid={invalidField === 'buyIn'}
            aria-describedby={invalidField === 'buyIn' ? errorId('buyIn') : undefined}
            className='pl-8'
          />
        </div>
        {invalidField === 'buyIn' && (
          <FieldError id={errorId('buyIn')}>{fieldMessages.buyIn}</FieldError>
        )}
        <QuickPicks label='Quick amounts'>
          {picks.buyIns.map((cents) => (
            <QuickPick
              key={cents}
              selected={buyInCents === cents}
              onPick={() => setBuyIn(centsToInput(cents))}>
              {formatDollars(cents)}
            </QuickPick>
          ))}
        </QuickPicks>
      </div>

      {result?.kind === 'night-closed' && (
        <p
          role='alert'
          className='rounded-2xl bg-error-soft px-4 py-3 text-sm font-semibold text-error'>
          This night is closed. Reopen it to edit.
        </p>
      )}
      {result?.kind === 'not-found' && (
        <p
          role='alert'
          className='rounded-2xl bg-error-soft px-4 py-3 text-sm font-semibold text-error'>
          Night not found.
        </p>
      )}

      <Button type='submit' size='lg' disabled={pending} className='w-full sm:w-auto sm:self-start'>
        {pending ? pendingLabel : submitLabel}
      </Button>
    </form>
  );
}
