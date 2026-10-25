'use client';

import { SettingsSection } from '@/app/(group)/settings/settings-section';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatNightDate } from '@/nights/dates';
import { mergePlayersAction } from '@/players/actions';
import { PlayerAvatar } from '@/players/player-avatar';
import { ArrowDown, ArrowRight, CircleAlert, Merge } from 'lucide-react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

type PlayerOption = { id: string; name: string; colorSlot: number };

type MergeRefusal = { kind: 'same-night'; dates: string[] } | null;

function useMergePlayers() {
  const [fromId, setFromId] = useState('');
  const [intoId, setIntoId] = useState('');
  const [refusal, setRefusal] = useState<MergeRefusal>(null);
  const [pending, startTransition] = useTransition();

  function pick(set: (value: string) => void) {
    return (value: string) => {
      set(value);
      setRefusal(null);
    };
  }

  function merge() {
    const form = new FormData();
    form.set('fromId', fromId);
    form.set('intoId', intoId);
    setRefusal(null);
    startTransition(async () => {
      const result = await mergePlayersAction(form);
      if (result.kind === 'merged') {
        toast.success('Players merged.');
        setFromId('');
        setIntoId('');
      } else if (result.kind === 'same-night') {
        setRefusal({ kind: 'same-night', dates: result.dates });
      } else if (result.kind === 'same-player') {
        toast.error('Pick two different players.');
      } else if (result.kind === 'not-found') {
        toast.error('One of those players no longer exists.');
      } else {
        toast.error('Pick both players.');
      }
    });
  }

  return {
    fromId,
    intoId,
    pickFrom: pick(setFromId),
    pickInto: pick(setIntoId),
    refusal,
    pending,
    merge,
  };
}

export function MergePlayersForm({ players }: { players: PlayerOption[] }) {
  const { fromId, intoId, pickFrom, pickInto, refusal, pending, merge } = useMergePlayers();
  const fromName = players.find((player) => player.id === fromId)?.name ?? '';
  const intoName = players.find((player) => player.id === intoId)?.name ?? '';

  return (
    <SettingsSection
      id='merge-heading'
      icon={Merge}
      title='Merge players'
      description='Same person logged twice? Fold the duplicate into the real one.'>
      <div className='grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]'>
        <PlayerPicker
          id='merge-from'
          label='Duplicate'
          value={fromId}
          onChange={pickFrom}
          players={players}
          excludeId={intoId}
        />
        <span aria-hidden className='-my-1 grid h-6 place-items-center text-ink-3 sm:my-0 sm:h-11'>
          <ArrowDown className='size-5 sm:hidden' strokeWidth={2.5} />
          <ArrowRight className='hidden size-5 sm:block' strokeWidth={2.5} />
        </span>
        <PlayerPicker
          id='merge-into'
          label='Keep'
          value={intoId}
          onChange={pickInto}
          players={players}
          excludeId={fromId}
        />
      </div>
      <p className='mt-4 text-sm font-semibold text-ink-2'>
        The duplicate&apos;s nights move over, then the duplicate is removed.
      </p>
      {refusal && (
        <p
          role='alert'
          className='mt-4 flex gap-2 rounded-2xl bg-error-soft px-4 py-3 text-sm font-semibold text-error'>
          <CircleAlert aria-hidden className='mt-0.5 size-4 shrink-0' />
          <span>
            Both played on {refusal.dates.map(formatNightDate).join(', ')}. Fix those nights first,
            then merge.
          </span>
        </p>
      )}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type='button'
            className='mt-5'
            disabled={pending || fromId === '' || intoId === ''}>
            {pending ? 'Merging…' : 'Merge players'}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Merge {fromName} into {intoName}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {fromName}&apos;s nights move to {intoName} and {fromName} is removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={merge}>Merge players</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SettingsSection>
  );
}

function PlayerPicker({
  id,
  label,
  value,
  onChange,
  players,
  excludeId,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  players: PlayerOption[];
  excludeId: string;
}) {
  return (
    <div className='flex min-w-0 flex-col gap-2.5'>
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className='w-full pl-2'>
          <SelectValue placeholder={<span className='pl-2'>Pick a player</span>} />
        </SelectTrigger>
        <SelectContent>
          {players.map((player) => (
            <SelectItem
              key={player.id}
              value={player.id}
              disabled={player.id === excludeId}
              className='pl-2'>
              <PlayerAvatar colorSlot={player.colorSlot} name={player.name} size={28} />
              <span className='truncate'>{player.name}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
