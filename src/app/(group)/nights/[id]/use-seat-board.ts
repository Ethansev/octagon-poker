'use client';

import type { SeatData } from '@/app/(group)/nights/[id]/seat-data';
import type { SeatField } from '@/app/(group)/nights/[id]/use-seat-editor';
import type { Player } from '@/players/players';
import type { RefObject } from 'react';
import { useState, useSyncExternalStore } from 'react';

export type BoardLayout = 'desktop' | 'mobile' | 'unknown';

const desktopQuery = '(min-width: 1024px)';

function subscribeToLayout(onChange: () => void) {
  const media = window.matchMedia(desktopQuery);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

export function useBoardLayout(): BoardLayout {
  return useSyncExternalStore<BoardLayout>(
    subscribeToLayout,
    () => (window.matchMedia(desktopQuery).matches ? 'desktop' : 'mobile'),
    () => 'unknown',
  );
}

export function useDraftSeats(
  seats: SeatData[],
  stepCents: number | null,
  viewerPlayerId: string | null,
) {
  const [drafts, setDrafts] = useState<SeatData[]>([]);

  const seatedIds = new Set(seats.map((seat) => seat.playerId));
  const rows = [...seats, ...drafts.filter((draft) => !seatedIds.has(draft.playerId))].sort(
    (a, b) =>
      Number(b.playerId === viewerPlayerId) - Number(a.playerId === viewerPlayerId) ||
      a.playerName.localeCompare(b.playerName),
  );

  function addDraft(player: Player) {
    setDrafts((current) => [
      ...current.filter((draft) => draft.playerId !== player.id),
      {
        playerId: player.id,
        playerName: player.name,
        colorSlot: player.colorSlot,
        buyInCents: stepCents,
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

function firstPick(seats: SeatData[], viewerPlayerId: string | null): string | null {
  const pick =
    seats.find((seat) => seat.playerId === viewerPlayerId) ??
    seats.find((seat) => seat.cashOutCents === null) ??
    seats[0];
  return pick?.playerId ?? null;
}

type Editing = { playerId: string; focus: SeatField | null };

export function useSeatSelection(
  rows: SeatData[],
  initialSeats: SeatData[],
  viewerPlayerId: string | null,
  layout: BoardLayout,
  addTileRef: RefObject<HTMLButtonElement | null>,
) {
  const [editing, setEditing] = useState<Editing | null>(() => {
    const playerId = firstPick(initialSeats, viewerPlayerId);
    return playerId === null ? null : { playerId, focus: null };
  });
  const [sheetOpen, setSheetOpen] = useState(false);

  const selected = rows.find((seat) => seat.playerId === editing?.playerId) ?? null;

  function open(playerId: string, focus: SeatField) {
    if (layout === 'mobile') {
      setEditing({ playerId, focus: null });
      setSheetOpen(true);
      return;
    }
    setEditing({ playerId, focus });
  }

  function afterSave(playerId: string) {
    if (layout === 'mobile') {
      setSheetOpen(false);
      return;
    }
    const next = rows[rows.findIndex((seat) => seat.playerId === playerId) + 1];
    if (next) {
      setEditing({ playerId: next.playerId, focus: 'cashOut' });
      return;
    }
    setEditing({ playerId, focus: null });
    addTileRef.current?.focus();
  }

  function afterRemove() {
    setEditing(null);
    setSheetOpen(false);
  }

  return {
    selected,
    focus: editing?.focus ?? null,
    sheetOpen: sheetOpen && selected !== null,
    setSheetOpen,
    open,
    afterSave,
    afterRemove,
  };
}
