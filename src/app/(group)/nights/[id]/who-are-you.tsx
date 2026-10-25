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
import { Hand } from 'lucide-react';
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
    <section
      aria-labelledby='who-heading'
      className='flex flex-col gap-4 rounded-panel bg-surface p-5 shadow-card sm:flex-row sm:items-center sm:p-6'>
      <div className='flex flex-1 items-center gap-4'>
        <span
          aria-hidden
          className='grid size-12 shrink-0 place-items-center rounded-2xl bg-surface-3 text-ink'>
          <Hand className='size-6' />
        </span>
        <div className='min-w-0'>
          <h2 id='who-heading' className='text-xl font-bold tracking-tight'>
            Hey, who are you?
          </h2>
          <p className='text-sm font-semibold text-ink-2'>
            Pick your name so we can save your seat as “You”.
          </p>
        </div>
      </div>
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
            className='w-full sm:w-44'
          />
          <Button type='submit' disabled={me.pending || name.trim() === ''}>
            Continue
          </Button>
        </form>
      ) : (
        <div className='flex items-center gap-2'>
          <Select disabled={me.pending} onValueChange={me.chooseExisting}>
            <SelectTrigger aria-label='Pick your name' className='w-full sm:w-44'>
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
          <Button type='button' variant='outline' onClick={() => setAdding(true)}>
            I&apos;m new
          </Button>
        </div>
      )}
    </section>
  );
}
