'use server';

import { actorFor, requireOwner, requireViewer } from '@/access/viewer';
import { parseDollars } from '@/money/money';
import { isRealDate } from '@/nights/dates';
import type {
  CloseNightResult,
  RemoveSeatResult,
  UpdateNightResult,
  UpsertSeatResult,
} from '@/nights/nights';
import {
  closeNight,
  createNight,
  deleteNight,
  removeSeat,
  reopenNight,
  updateNight,
  upsertSeat,
} from '@/nights/nights';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

export type NightFormInvalid = { kind: 'invalid'; field: 'date' | 'location' | 'buyIn' };
export type SeatInvalid = { kind: 'invalid'; field: 'buyIn' | 'cashOut' };

const MAX_LOCATION_LENGTH = 80;

const idSchema = z.uuid();

const seatInputSchema = z.object({
  nightId: z.uuid(),
  playerId: z.uuid(),
  buyIn: z.string(),
  cashOut: z.string(),
  expectedUpdatedAt: z.iso.datetime().nullable(),
});

type NightFields = { date: string; location: string | null; buyInCents: number | null };

function parseNightFields(formData: FormData): NightFields | NightFormInvalid {
  const date = z.string().safeParse(formData.get('date'));
  if (!date.success || !isRealDate(date.data)) return { kind: 'invalid', field: 'date' };

  const rawLocation = z.string().safeParse(formData.get('location') ?? '');
  const location = rawLocation.success ? rawLocation.data.trim() : '';
  if (location.length > MAX_LOCATION_LENGTH) return { kind: 'invalid', field: 'location' };

  const rawBuyIn = z.string().safeParse(formData.get('buyIn') ?? '');
  const buyIn = parseDollars(rawBuyIn.success ? rawBuyIn.data : '');
  if (buyIn.kind === 'invalid') return { kind: 'invalid', field: 'buyIn' };

  return {
    date: date.data,
    location: location === '' ? null : location,
    buyInCents: buyIn.kind === 'amount' ? buyIn.cents : null,
  };
}

function refreshNight(nightId: string) {
  revalidatePath(`/nights/${nightId}`);
  revalidatePath('/');
  revalidatePath('/players/[id]', 'page');
  revalidatePath('/recap/[year]', 'page');
}

export async function createNightAction(formData: FormData): Promise<NightFormInvalid> {
  const viewer = await requireViewer();
  const fields = parseNightFields(formData);
  if ('kind' in fields) return fields;

  const { id } = await createNight({ groupId: viewer.group.id, ...fields }, actorFor(viewer));
  refreshNight(id);
  redirect(`/nights/${id}`);
}

export async function updateNightAction(
  formData: FormData,
): Promise<UpdateNightResult | NightFormInvalid> {
  const viewer = await requireViewer();
  const nightId = idSchema.safeParse(formData.get('nightId'));
  if (!nightId.success) return { kind: 'not-found' };
  const fields = parseNightFields(formData);
  if ('kind' in fields) return fields;

  const result = await updateNight(
    { groupId: viewer.group.id, nightId: nightId.data, ...fields },
    actorFor(viewer),
  );
  refreshNight(nightId.data);
  return result;
}

export async function saveSeatAction(input: {
  nightId: string;
  playerId: string;
  buyIn: string;
  cashOut: string;
  expectedUpdatedAt: string | null;
}): Promise<UpsertSeatResult | SeatInvalid> {
  const viewer = await requireViewer();
  const parsed = seatInputSchema.safeParse(input);
  if (!parsed.success) return { kind: 'not-found' };

  const buyIn = parseDollars(parsed.data.buyIn);
  if (buyIn.kind !== 'amount') return { kind: 'invalid', field: 'buyIn' };
  const cashOut = parseDollars(parsed.data.cashOut);
  if (cashOut.kind === 'invalid') return { kind: 'invalid', field: 'cashOut' };

  const result = await upsertSeat(
    {
      groupId: viewer.group.id,
      nightId: parsed.data.nightId,
      playerId: parsed.data.playerId,
      buyInCents: buyIn.cents,
      cashOutCents: cashOut.kind === 'amount' ? cashOut.cents : null,
      expectedUpdatedAt:
        parsed.data.expectedUpdatedAt === null ? null : new Date(parsed.data.expectedUpdatedAt),
    },
    actorFor(viewer),
  );
  refreshNight(parsed.data.nightId);
  return result;
}

export async function removeSeatAction(input: {
  nightId: string;
  playerId: string;
}): Promise<RemoveSeatResult> {
  const viewer = await requireViewer();
  const parsed = z.object({ nightId: z.uuid(), playerId: z.uuid() }).safeParse(input);
  if (!parsed.success) return { kind: 'not-found' };

  const result = await removeSeat({ groupId: viewer.group.id, ...parsed.data }, actorFor(viewer));
  refreshNight(parsed.data.nightId);
  return result;
}

export async function closeNightAction(nightId: string): Promise<CloseNightResult> {
  const viewer = await requireOwner();
  const parsed = idSchema.safeParse(nightId);
  if (!parsed.success) return { kind: 'not-found' };

  const result = await closeNight(viewer.group.id, parsed.data);
  refreshNight(parsed.data);
  return result;
}

export async function reopenNightAction(
  nightId: string,
): Promise<{ kind: 'reopened' } | { kind: 'not-found' }> {
  const viewer = await requireOwner();
  const parsed = idSchema.safeParse(nightId);
  if (!parsed.success) return { kind: 'not-found' };

  const result = await reopenNight(viewer.group.id, parsed.data);
  refreshNight(parsed.data);
  return result;
}

export async function deleteNightAction(nightId: string): Promise<{ kind: 'not-found' }> {
  const viewer = await requireOwner();
  const parsed = idSchema.safeParse(nightId);
  if (!parsed.success) return { kind: 'not-found' };

  const result = await deleteNight(viewer.group.id, parsed.data);
  if (result.kind === 'not-found') return result;
  refreshNight(parsed.data);
  redirect('/');
}
