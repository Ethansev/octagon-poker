'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useState, useTransition, type FormEvent } from 'react';
import { toast } from 'sonner';

type PlayerOption = { id: string; name: string };

type MergeRefusal = { kind: 'same-night'; dates: string[] } | null;

export function MergePlayersForm({ players }: { players: PlayerOption[] }) {
  const [fromId, setFromId] = useState('');
  const [intoId, setIntoId] = useState('');
  const [refusal, setRefusal] = useState<MergeRefusal>(null);
  const [pending, startTransition] = useTransition();

  function changePlayer(set: (value: string) => void, value: string) {
    set(value);
    setRefusal(null);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Merge players</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className='space-y-3'>
          <div className='grid gap-3 sm:grid-cols-2'>
            <PlayerSelect
              label='Merge'
              value={fromId}
              onChange={(value) => changePlayer(setFromId, value)}
              players={players}
            />
            <PlayerSelect
              label='into'
              value={intoId}
              onChange={(value) => changePlayer(setIntoId, value)}
              players={players}
            />
          </div>
          <p className='text-sm text-slate-500'>
            The first player&apos;s nights move to the second, and the first is removed.
          </p>
          {refusal && (
            <p role='alert' className='text-sm text-red-600'>
              Both played on {refusal.dates.map(formatNightDate).join(', ')}. Fix those nights
              first, then merge.
            </p>
          )}
          <Button type='submit' disabled={pending || fromId === '' || intoId === ''}>
            Merge players
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PlayerSelect({
  label,
  value,
  onChange,
  players,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  players: PlayerOption[];
}) {
  const id = `merge-${label}`;
  return (
    <div className='flex flex-col gap-2'>
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id}>
          <SelectValue placeholder='Pick a player' />
        </SelectTrigger>
        <SelectContent>
          {players.map((player) => (
            <SelectItem key={player.id} value={player.id}>
              {player.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
