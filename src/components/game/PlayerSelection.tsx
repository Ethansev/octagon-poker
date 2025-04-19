'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Player } from '@/dal/player';
import { useGameStore } from '@/store/game';
import { useState } from 'react';

type Props = {
  players: Player[];

  // TODO: not sure if I want handlePlayerToggle here
  handlePlayerToggle?: (playerId: string) => void;
};

export default function PlayerSelection({ players }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const { activePlayerIds, setActivePlayerIds } = useGameStore();

  function handlePlayerToggle(playerId: number) {
    const player = players.find((player) => player.id === playerId);

    if (!player) {
      console.error(`Player with id ${playerId} not found`);
      return;
    }

    if (activePlayerIds.includes(playerId)) {
      setError(`${player.first_name} already has stats, are you sure?`);
      setCurrentPlayer(player);
    } else {
      setActivePlayerIds([...activePlayerIds, playerId]);
    }
  }

  function handleClearButtonClick(event: React.MouseEvent) {
    event.stopPropagation(); // Prevent event from bubbling up

    setActivePlayerIds(activePlayerIds.filter((id) => id !== currentPlayer?.id));
    setError(null);
    setCurrentPlayer(null);
  }

  return (
    <div className='p-4'>
      <div className='mb-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'>
        {players.map((player) => (
          <div key={player.id} className='flex items-center space-x-2'>
            <Checkbox
              id={`player-${player.id}`}
              checked={activePlayerIds.includes(player.id)}
              onCheckedChange={() => handlePlayerToggle(player.id)}
            />
            <Label htmlFor={`player-${player.id}`}>{player.first_name}</Label>
            {currentPlayer?.id === player.id && error && (
              <div className='text-red-500'>
                <Button
                  variant='destructive'
                  className='h-6 px-2 py-0.5 text-xs'
                  onClick={(e) => handleClearButtonClick(e)}>
                  Clear
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
      <div>{error && <div className='text-red-500'>{error}</div>}</div>
    </div>
  );
}
