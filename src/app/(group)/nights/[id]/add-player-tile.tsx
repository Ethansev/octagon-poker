'use client';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { addPlayerAction } from '@/players/actions';
import { PlayerAvatar } from '@/players/player-avatar';
import type { Player } from '@/players/players';
import { Plus, UserPlus } from 'lucide-react';
import type { Ref } from 'react';
import { useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';

type AddPlayerTileProps = {
  available: Player[];
  allNames: string[];
  onPick: (player: Player) => void;
  ref?: Ref<HTMLButtonElement>;
};

function useAddPlayer(allNames: string[], onPick: (player: Player) => void) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [pending, startTransition] = useTransition();
  const picked = useRef(false);

  const typed = query.trim();
  const canCreate =
    typed !== '' && !allNames.some((name) => name.toLowerCase() === typed.toLowerCase());

  function choose(player: Player) {
    picked.current = true;
    setOpen(false);
    setQuery('');
    onPick(player);
  }

  function create() {
    const formData = new FormData();
    formData.set('name', typed);
    startTransition(async () => {
      const result = await addPlayerAction(formData);
      if (result.kind === 'added' || result.kind === 'exists') choose(result.player);
      else toast.error("That name didn't work. Try a shorter one.");
    });
  }

  function keepFocusOnPick(event: Event) {
    if (picked.current) event.preventDefault();
    picked.current = false;
  }

  return {
    open,
    setOpen,
    query,
    setQuery,
    typed,
    canCreate,
    pending,
    choose,
    create,
    keepFocusOnPick,
  };
}

export function AddPlayerTile({ available, allNames, onPick, ref }: AddPlayerTileProps) {
  const add = useAddPlayer(allNames, onPick);
  const needle = add.typed.toLowerCase();
  const matches = available.filter((player) => player.name.toLowerCase().includes(needle));

  return (
    <Popover open={add.open} onOpenChange={add.setOpen}>
      <PopoverTrigger asChild>
        <button
          ref={ref}
          type='button'
          disabled={add.pending}
          className='group flex h-full min-h-36 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-line p-4 text-sm font-extrabold text-ink-2 transition hover:border-ink-3 hover:bg-surface-2 hover:text-ink focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none'>
          <span className='grid size-11 place-items-center rounded-full bg-surface-3 transition group-hover:bg-ink group-hover:text-surface motion-reduce:transition-none'>
            <Plus aria-hidden className='size-5' strokeWidth={3} />
          </span>
          Add player
        </button>
      </PopoverTrigger>
      <PopoverContent
        align='start'
        className='w-72 overflow-hidden p-0'
        onCloseAutoFocus={add.keepFocusOnPick}>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder='Search or add a name'
            value={add.query}
            onValueChange={add.setQuery}
          />
          <CommandList>
            {matches.length === 0 && !add.canCreate && (
              <CommandEmpty>Everyone’s already at the table.</CommandEmpty>
            )}
            <CommandGroup>
              {matches.map((player) => (
                <CommandItem
                  key={player.id}
                  value={player.id}
                  onSelect={() => add.choose(player)}
                  className='gap-2.5'>
                  <PlayerAvatar colorSlot={player.colorSlot} name={player.name} size={26} />
                  {player.name}
                </CommandItem>
              ))}
              {add.canCreate && (
                <CommandItem value='create-new-player' onSelect={add.create} className='gap-2.5'>
                  <span className='grid size-[26px] place-items-center rounded-full bg-surface-3'>
                    <UserPlus aria-hidden className='size-3.5' />
                  </span>
                  Add &ldquo;{add.typed}&rdquo;
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
