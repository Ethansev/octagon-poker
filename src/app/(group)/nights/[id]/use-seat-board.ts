'use client';

import type { SeatData } from '@/app/(group)/nights/[id]/seat-data';
import type { SeatField } from '@/app/(group)/nights/[id]/seat-edits';
import type { Player } from '@/players/players';
import type { RefObject } from 'react';
import { useRef, useState, useSyncExternalStore } from 'react';

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
  const editingRef = useRef(editing);
  const [sheetFor, setSheetFor] = useState<string | null>(null);

  const selected = rows.find((seat) => seat.playerId === editing?.playerId) ?? null;

  function select(next: Editing | null) {
    editingRef.current = next;
    setEditing(next);
  }

  function closeSheetFor(playerId: string) {
    setSheetFor((current) => (current === playerId ? null : current));
  }

  function open(playerId: string, focus: SeatField) {
    if (layout === 'mobile') {
      select({ playerId, focus: null });
      setSheetFor(playerId);
      return;
    }
    select({ playerId, focus });
  }

  function afterSave(playerId: string) {
    closeSheetFor(playerId);
    if (layout === 'mobile' || editingRef.current?.playerId !== playerId) return;
    const next = rows[rows.findIndex((seat) => seat.playerId === playerId) + 1];
    if (next) {
      select({ playerId: next.playerId, focus: 'cashOut' });
      return;
    }
    select({ playerId, focus: null });
    addTileRef.current?.focus();
  }

  function afterRemove(playerId: string) {
    closeSheetFor(playerId);
    if (editingRef.current?.playerId === playerId) select(null);
  }

  return {
    selected,
    focus: editing?.focus ?? null,
    sheetOpen: sheetFor !== null && sheetFor === selected?.playerId,
    closeSheet: () => setSheetFor(null),
    open,
    afterSave,
    afterRemove,
  };
}
