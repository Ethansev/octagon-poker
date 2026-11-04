'use client';

import { AddPlayerButton } from '@/app/(group)/nights/[id]/add-player-tile';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { formatDollars } from '@/money/money';
import { addSeatsAction } from '@/nights/actions';
import { addPlayerAction } from '@/players/actions';
import { PlayerAvatar } from '@/players/player-avatar';
import type { Player } from '@/players/players';
import { Check, UserPlus } from 'lucide-react';
import type { Ref } from 'react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

type QuickAddTileProps = {
  nightId: string;
  buyInCents: number;
  available: Player[];
  allNames: string[];
  ref?: Ref<HTMLButtonElement>;
};

function useQuickAdd(nightId: string, allNames: string[]) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<Player[]>([]);
  const [pending, startTransition] = useTransition();

  const typed = query.trim();
  const canCreate =
    typed !== '' &&
    ![...allNames, ...picked.map((player) => player.name)].some(
      (name) => name.toLowerCase() === typed.toLowerCase(),
    );

  function toggle(player: Player) {
    setQuery('');
    setPicked((current) =>
      current.some((other) => other.id === player.id)
        ? current.filter((other) => other.id !== player.id)
        : [...current, player],
    );
  }

  function create() {
    const formData = new FormData();
    formData.set('name', typed);
    startTransition(async () => {
      const result = await addPlayerAction(formData);
      if (result.kind === 'added' || result.kind === 'exists') {
        setQuery('');
        setPicked((current) =>
          current.some((other) => other.id === result.player.id)
            ? current
            : [...current, result.player],
        );
      } else {
        toast.error("That name didn't work. Try a shorter one.");
      }
    });
  }

  function seat() {
    startTransition(async () => {
      const result = await addSeatsAction({
        nightId,
        playerIds: picked.map((player) => player.id),
      });
      if (result.kind === 'added') {
        setPicked([]);
        setOpen(false);
        return;
      }
      if (result.kind === 'night-closed') toast.error('This night is already in the books.');
      else toast.error('Couldn’t add them. Refresh and try again.');
    });
  }

  return {
    open,
    setOpen,
    query,
    setQuery,
    typed,
    canCreate,
    picked,
    pending,
    toggle,
    create,
    seat,
  };
}

export function QuickAddTile({ nightId, buyInCents, available, allNames, ref }: QuickAddTileProps) {
  const add = useQuickAdd(nightId, allNames);
  const needle = add.typed.toLowerCase();
  const pickedIds = new Set(add.picked.map((player) => player.id));
  const newlyAdded = add.picked.filter(
    (player) => !available.some((other) => other.id === player.id),
  );
  const matches = [...newlyAdded, ...available].filter((player) =>
    player.name.toLowerCase().includes(needle),
  );
  const count = add.picked.length;

  return (
    <Popover open={add.open} onOpenChange={add.setOpen}>
      <PopoverTrigger asChild>
        <AddPlayerButton ref={ref} />
      </PopoverTrigger>
      <PopoverContent align='start' className='w-72 overflow-hidden p-0'>
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
              {matches.map((player) => {
                const isPicked = pickedIds.has(player.id);
                return (
                  <CommandItem
                    key={player.id}
                    value={player.id}
                    onSelect={() => add.toggle(player)}
                    className='gap-2.5'>
                    <PlayerAvatar colorSlot={player.colorSlot} name={player.name} size={26} />
                    <span className='min-w-0 flex-1 truncate'>{player.name}</span>
                    <span
                      aria-hidden
                      className={cn(
                        'grid size-5 shrink-0 place-items-center rounded-full border-2',
                        isPicked ? 'border-primary bg-primary' : 'border-line',
                      )}>
                      {isPicked && <Check className='size-3 !text-primary-ink' strokeWidth={4} />}
                    </span>
                    {isPicked && <span className='sr-only'>, picked</span>}
                  </CommandItem>
                );
              })}
              {add.canCreate && (
                <CommandItem
                  value='create-new-player'
                  disabled={add.pending}
                  onSelect={add.create}
                  className='gap-2.5'>
                  <span className='grid size-[26px] place-items-center rounded-full bg-surface-3'>
                    <UserPlus aria-hidden className='size-3.5' />
                  </span>
                  Add &ldquo;{add.typed}&rdquo;
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
        <div className='border-t border-line p-2'>
          {count === 0 ? (
            <p className='px-2 py-1.5 text-sm font-semibold text-ink-2'>
              Tap everyone who’s in. Each starts with {formatDollars(buyInCents)}.
            </p>
          ) : (
            <Button type='button' disabled={add.pending} onClick={add.seat} className='h-11 w-full'>
              {add.pending ? 'Adding…' : `Add ${count} ${count === 1 ? 'player' : 'players'}`}
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
