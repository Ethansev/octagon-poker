'use client';

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
import { addPlayerAction } from '@/players/actions';
import type { Player } from '@/players/players';
import { Plus } from 'lucide-react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

type AddPlayerRowProps = {
  available: Player[];
  allNames: string[];
  onPick: (player: Player) => void;
};

function useAddPlayer(allNames: string[], onPick: (player: Player) => void) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [pending, startTransition] = useTransition();

  const typed = query.trim();
  const canCreate =
    typed !== '' && !allNames.some((name) => name.toLowerCase() === typed.toLowerCase());

  function choose(player: Player) {
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

  return { open, setOpen, query, setQuery, typed, canCreate, pending, choose, create };
}

export function AddPlayerRow({ available, allNames, onPick }: AddPlayerRowProps) {
  const add = useAddPlayer(allNames, onPick);
  const needle = add.typed.toLowerCase();
  const matches = available.filter((player) => player.name.toLowerCase().includes(needle));

  return (
    <div className='pt-3'>
      <Popover open={add.open} onOpenChange={add.setOpen}>
        <PopoverTrigger asChild>
          <Button type='button' variant='outline' size='sm' data-add-player disabled={add.pending}>
            <Plus /> Add player
          </Button>
        </PopoverTrigger>
        <PopoverContent align='start' className='w-64 p-0'>
          <Command shouldFilter={false}>
            <CommandInput
              placeholder='Search or add a name'
              value={add.query}
              onValueChange={add.setQuery}
            />
            <CommandList>
              {matches.length === 0 && !add.canCreate && (
                <CommandEmpty>No one else to add.</CommandEmpty>
              )}
              <CommandGroup>
                {matches.map((player) => (
                  <CommandItem
                    key={player.id}
                    value={player.id}
                    onSelect={() => add.choose(player)}>
                    {player.name}
                  </CommandItem>
                ))}
                {add.canCreate && (
                  <CommandItem value='create-new-player' onSelect={add.create}>
                    Add &ldquo;{add.typed}&rdquo;
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
