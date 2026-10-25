'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { addPlayerAction, chooseMeAction } from '@/players/actions';
import type { Player } from '@/players/players';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

function useChooseMe() {
  const [pending, startTransition] = useTransition();

  function chooseExisting(playerId: string) {
    startTransition(async () => {
      const result = await chooseMeAction(playerId);
      if (result.kind !== 'chosen') toast.error("Couldn't pick that name. Try again.");
    });
  }

  function chooseNew(name: string) {
    const formData = new FormData();
    formData.set('name', name);
    startTransition(async () => {
      const added = await addPlayerAction(formData);
      if (added.kind !== 'added' && added.kind !== 'exists') {
        toast.error("That name didn't work. Try a shorter one.");
        return;
      }
      const result = await chooseMeAction(added.player.id);
      if (result.kind !== 'chosen') toast.error("Couldn't pick that name. Try again.");
    });
  }

  return { pending, chooseExisting, chooseNew };
}

export function WhoAreYou({ players }: { players: Player[] }) {
  const me = useChooseMe();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');

  return (
    <div className='flex flex-wrap items-center gap-2 rounded-2xl bg-surface px-3 py-2 shadow-card'>
      <span className='text-sm font-semibold text-ink'>Who are you?</span>
      {adding ? (
        <form
          className='flex items-center gap-2'
          onSubmit={(event) => {
            event.preventDefault();
            me.chooseNew(name);
          }}>
          <Input
            aria-label='Your name'
            placeholder='Your name'
            value={name}
            autoFocus
            onChange={(event) => setName(event.target.value)}
            className='h-8 w-40'
          />
          <Button type='submit' size='sm' disabled={me.pending || name.trim() === ''}>
            Continue
          </Button>
        </form>
      ) : (
        <>
          <Select disabled={me.pending} onValueChange={me.chooseExisting}>
            <SelectTrigger size='sm' aria-label='Pick your name' className='w-40'>
              <SelectValue placeholder='Pick your name' />
            </SelectTrigger>
            <SelectContent>
              {players.map((player) => (
                <SelectItem key={player.id} value={player.id}>
                  {player.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type='button' size='sm' variant='outline' onClick={() => setAdding(true)}>
            I&apos;m new
          </Button>
        </>
      )}
    </div>
  );
}
