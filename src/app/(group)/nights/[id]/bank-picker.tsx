'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { setBankAction } from '@/nights/actions';
import type { SeatView } from '@/nights/nights';
import { PlayerAvatar } from '@/players/player-avatar';
import { useTransition } from 'react';
import { toast } from 'sonner';

function useSetBank(nightId: string) {
  const [pending, startTransition] = useTransition();

  function choose(playerId: string) {
    startTransition(async () => {
      const result = await setBankAction({ nightId, playerId });
      if (result.kind === 'not-seated') toast.error('Only someone at the table can hold the bank.');
      if (result.kind === 'night-closed') toast.error('The night is already closed.');
      if (result.kind === 'not-found') toast.error('Night not found.');
    });
  }

  return { pending, choose };
}

export function BankPicker({
  nightId,
  seats,
  bankPlayerId,
}: {
  nightId: string;
  seats: SeatView[];
  bankPlayerId: string | null;
}) {
  const bank = useSetBank(nightId);

  return (
    <Select value={bankPlayerId ?? undefined} onValueChange={bank.choose} disabled={bank.pending}>
      <SelectTrigger aria-label='Who’s holding the bank' className='w-full pl-2 sm:w-48'>
        <SelectValue placeholder={<span className='pl-2'>Pick the bank</span>} />
      </SelectTrigger>
      <SelectContent>
        {seats.map((seat) => (
          <SelectItem key={seat.playerId} value={seat.playerId} className='pl-2'>
            <PlayerAvatar colorSlot={seat.playerColorSlot} name={seat.playerName} size={28} />
            <span className='truncate'>{seat.playerName}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
