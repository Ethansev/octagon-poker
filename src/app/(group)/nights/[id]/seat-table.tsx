'use client';

import { AddPlayerRow } from '@/app/(group)/nights/[id]/add-player-row';
import type { SeatData } from '@/app/(group)/nights/[id]/seat-data';
import { rowGrid } from '@/app/(group)/nights/[id]/seat-grid';
import { SeatRow } from '@/app/(group)/nights/[id]/seat-row';
import { formatDollars, formatNet } from '@/money/money';
import type { Player } from '@/players/players';
import { useRef, useState } from 'react';

type SeatTableProps = {
  nightId: string;
  typicalBuyInCents: number | null;
  seats: SeatData[];
  players: Player[];
  readOnly: boolean;
};

function useSeatTableFocus() {
  const container = useRef<HTMLDivElement>(null);

  function focusAfter(playerId: string) {
    const inputs = Array.from(
      container.current?.querySelectorAll<HTMLInputElement>('[data-field="buyIn"]') ?? [],
    );
    const index = inputs.findIndex((input) => input.dataset.seatInput === playerId);
    const next = inputs[index + 1];
    if (next) next.focus();
    else container.current?.querySelector<HTMLButtonElement>('[data-add-player]')?.focus();
  }

  return { container, focusAfter };
}

function useDraftSeats(seats: SeatData[], typicalBuyInCents: number | null) {
  const [drafts, setDrafts] = useState<SeatData[]>([]);

  const seatedIds = new Set(seats.map((seat) => seat.playerId));
  const visibleDrafts = drafts.filter((draft) => !seatedIds.has(draft.playerId));
  const rows = [...seats, ...visibleDrafts].sort((a, b) =>
    a.playerName.localeCompare(b.playerName),
  );

  function addDraft(player: Player) {
    setDrafts((current) => [
      ...current.filter((draft) => draft.playerId !== player.id),
      {
        playerId: player.id,
        playerName: player.name,
        buyInCents: typicalBuyInCents,
        cashOutCents: null,
        updatedAt: null,
      },
    ]);
  }

  function dropDraft(playerId: string) {
    setDrafts((current) => current.filter((draft) => draft.playerId !== playerId));
  }

  return { rows, addDraft, dropDraft };
}

function ReadOnlyRows({ seats }: { seats: SeatData[] }) {
  return (
    <div>
      {seats.map((seat) => {
        const net =
          seat.buyInCents !== null && seat.cashOutCents !== null
            ? seat.cashOutCents - seat.buyInCents
            : null;
        return (
          <div key={seat.playerId} className={`${rowGrid} border-b border-slate-100 py-2`}>
            <span className='col-span-2 truncate font-semibold text-slate-900 sm:col-span-1'>
              {seat.playerName}
            </span>
            <span className='col-start-1 row-start-2 text-slate-600 sm:col-start-auto sm:row-start-auto'>
              <span className='text-slate-400 sm:hidden'>In </span>
              {seat.buyInCents === null ? '' : formatDollars(seat.buyInCents)}
            </span>
            <span className='col-start-2 row-start-2 text-slate-600 sm:col-start-auto sm:row-start-auto'>
              <span className='text-slate-400 sm:hidden'>Out </span>
              {seat.cashOutCents === null ? '' : formatDollars(seat.cashOutCents)}
            </span>
            <span
              className={`col-start-3 row-start-1 text-right font-bold sm:col-start-auto sm:row-start-auto ${net !== null && net > 0 ? 'text-green-700' : 'text-slate-400'}`}>
              {net === null ? '' : formatNet(net)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function SeatTable({
  nightId,
  typicalBuyInCents,
  seats,
  players,
  readOnly,
}: SeatTableProps) {
  const { container, focusAfter } = useSeatTableFocus();
  const { rows, addDraft, dropDraft } = useDraftSeats(seats, typicalBuyInCents);

  const seatedIds = new Set(rows.map((row) => row.playerId));
  const available = players.filter((player) => !seatedIds.has(player.id));

  if (readOnly) {
    return seats.length === 0 ? (
      <p className='text-sm text-slate-500'>No players were logged.</p>
    ) : (
      <ReadOnlyRows seats={seats} />
    );
  }

  return (
    <div ref={container}>
      <div className='hidden grid-cols-[1fr_6rem_6rem_4.5rem_auto] gap-2 pb-1 text-[10px] font-semibold tracking-wider text-slate-500 uppercase sm:grid'>
        <span>Player</span>
        <span>Buy-in</span>
        <span>Cash-out</span>
        <span className='text-right'>Net</span>
        <span className='w-[7.5rem]' />
      </div>
      {rows.map((seat) => (
        <SeatRow
          key={`${seat.playerId}:${seat.updatedAt ?? 'new'}`}
          nightId={nightId}
          seat={seat}
          onSubmitted={() => focusAfter(seat.playerId)}
          onGone={() => dropDraft(seat.playerId)}
        />
      ))}
      <AddPlayerRow
        available={available}
        allNames={players.map((player) => player.name)}
        onPick={addDraft}
      />
    </div>
  );
}
