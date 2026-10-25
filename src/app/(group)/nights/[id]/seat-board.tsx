'use client';

import { AddPlayerTile } from '@/app/(group)/nights/[id]/add-player-tile';
import { SeatCard } from '@/app/(group)/nights/[id]/seat-card';
import type { SeatData } from '@/app/(group)/nights/[id]/seat-data';
import { SeatEditor } from '@/app/(group)/nights/[id]/seat-editor';
import { isDirty } from '@/app/(group)/nights/[id]/seat-edits';
import {
  useBoardLayout,
  useDraftSeats,
  useSeatSelection,
} from '@/app/(group)/nights/[id]/use-seat-board';
import { useSeatEdits } from '@/app/(group)/nights/[id]/use-seat-editor';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { playerColor } from '@/players/player-color';
import type { Player } from '@/players/players';
import { MousePointerClick } from 'lucide-react';
import { useRef } from 'react';

type SeatBoardProps = {
  nightId: string;
  stepCents: number | null;
  seats: SeatData[];
  players: Player[];
  viewerPlayerId: string | null;
  children: React.ReactNode;
};

function EmptyPanel() {
  return (
    <div className='grid min-h-80 place-items-center rounded-panel border-2 border-dashed border-line p-8 text-center'>
      <div>
        <span className='mx-auto grid size-12 place-items-center rounded-full bg-surface-3 text-ink-2'>
          <MousePointerClick aria-hidden className='size-5' />
        </span>
        <p className='mt-3 text-lg font-bold'>Pick a seat</p>
        <p className='mt-1 text-sm font-semibold text-ink-2'>
          Tap anyone at the table to log a rebuy or a cash-out.
        </p>
      </div>
    </div>
  );
}

export function SeatBoard({
  nightId,
  stepCents,
  seats,
  players,
  viewerPlayerId,
  children,
}: SeatBoardProps) {
  const layout = useBoardLayout();
  const { rows, addDraft, dropDraft } = useDraftSeats(seats, stepCents, viewerPlayerId);
  const addTileRef = useRef<HTMLButtonElement>(null);
  const selection = useSeatSelection(rows, seats, viewerPlayerId, layout, addTileRef);
  const seatedIds = new Set(rows.map((row) => row.playerId));
  const available = players.filter((player) => !seatedIds.has(player.id));
  const edits = useSeatEdits();
  const { selected } = selection;

  const editor = selected && layout !== 'unknown' && (
    <SeatEditor
      key={selected.playerId}
      nightId={nightId}
      seat={selected}
      stepCents={stepCents}
      isYou={selected.playerId === viewerPlayerId}
      focusField={selection.focus}
      edits={edits}
      onSaved={() => selection.afterSave(selected.playerId)}
      onGone={() => {
        dropDraft(selected.playerId);
        edits.forget(selected.playerId);
        selection.afterRemove(selected.playerId);
      }}
    />
  );

  return (
    <div className='grid gap-6 lg:grid-cols-12 lg:gap-8'>
      <div className='space-y-6 lg:col-span-7'>
        <section
          aria-labelledby='table-heading'
          className='rounded-panel bg-surface p-5 shadow-card sm:p-7'>
          <h2 id='table-heading' className='text-3xl font-bold tracking-tight'>
            Who’s at the table
          </h2>
          <p className='mt-1 text-sm font-semibold text-ink-2'>
            Done playing? Tap your seat, count your chips, lock it in.
          </p>
          <ul className='mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3'>
            {rows.map((seat) => (
              <li key={seat.playerId}>
                <SeatCard
                  seat={seat}
                  isYou={seat.playerId === viewerPlayerId}
                  selected={layout === 'desktop' && seat.playerId === selected?.playerId}
                  unsaved={seat.updatedAt !== null && isDirty(edits.editFor(seat))}
                  onOpen={() => selection.open(seat.playerId, 'cashOut')}
                />
              </li>
            ))}
            <li>
              <AddPlayerTile
                ref={addTileRef}
                available={available}
                allNames={players.map((player) => player.name)}
                onPick={(player) => {
                  addDraft(player);
                  selection.open(player.id, 'buyIn');
                }}
              />
            </li>
          </ul>
        </section>
        {children}
      </div>

      {layout !== 'mobile' && (
        <aside aria-label='Seat editor' className='hidden lg:col-span-5 lg:block'>
          <div className='sticky top-24'>
            {layout === 'unknown' ? null : selected ? (
              <div
                className='rounded-panel p-6 shadow-card'
                style={{ background: playerColor(selected.colorSlot).soft }}>
                {editor}
              </div>
            ) : (
              <EmptyPanel />
            )}
          </div>
        </aside>
      )}

      {layout === 'mobile' && (
        <Sheet
          open={selection.sheetOpen}
          onOpenChange={(open) => {
            if (!open) selection.closeSheet();
          }}>
          <SheetContent
            aria-describedby={undefined}
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              if (event.currentTarget instanceof HTMLElement) event.currentTarget.focus();
            }}
            style={selected ? { background: playerColor(selected.colorSlot).soft } : undefined}>
            <SheetTitle className='sr-only'>
              {selected ? `${selected.playerName}'s seat` : 'Seat'}
            </SheetTitle>
            <div className='px-5 pt-4'>{editor}</div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
