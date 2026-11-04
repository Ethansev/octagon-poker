import { requireOwner } from '@/access/viewer';
import { InviteLinkCard } from '@/app/(group)/settings/invite-link-card';
import { MergePlayersForm } from '@/app/(group)/settings/merge-players-form';
import { RenameGroupForm } from '@/app/(group)/settings/rename-group-form';
import { SignOutCard } from '@/app/(group)/settings/sign-out-card';
import { env } from '@/env';
import { listPlayers } from '@/players/players';
import { ChevronRight, Users } from 'lucide-react';
import Link from 'next/link';

export default async function SettingsPage() {
  const viewer = await requireOwner();
  const players = await listPlayers(viewer.group.id);
  const joinUrl = `${env.BETTER_AUTH_URL}/join/${viewer.group.inviteCode}`;

  return (
    <div className='mx-auto max-w-[1360px] px-4 pt-6 pb-20 sm:px-6 lg:px-10 lg:pt-10'>
      <p className='text-sm font-extrabold tracking-[0.14em] text-ink-2 uppercase'>Host tools</p>
      <h1 className='mt-1 text-4xl leading-[1.02] font-bold tracking-tight sm:text-5xl lg:text-6xl'>
        Settings
      </h1>
      <div className='mt-6 grid items-start gap-6 lg:mt-8 lg:grid-cols-2 lg:gap-8'>
        <div className='flex flex-col gap-6 lg:gap-8'>
          <InviteLinkCard joinUrl={joinUrl} />
          <Link
            href='/players'
            className='flex cursor-pointer items-center gap-4 rounded-panel bg-surface p-6 shadow-card transition hover:bg-surface-2 focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none sm:p-8'>
            <span
              aria-hidden
              className='grid size-11 shrink-0 place-items-center rounded-2xl bg-surface-3 text-ink'>
              <Users className='size-5' strokeWidth={2.25} />
            </span>
            <span className='min-w-0 flex-1'>
              <span className='block text-xl leading-tight font-bold tracking-tight'>Players</span>
              <span className='mt-1 block text-sm font-semibold text-ink-2'>
                Names, Venmo and Zelle, and everyone’s record.
              </span>
            </span>
            <ChevronRight aria-hidden className='size-5 shrink-0 text-ink-2' />
          </Link>
          <RenameGroupForm name={viewer.group.name} />
        </div>
        <div className='flex flex-col gap-6 lg:gap-8'>
          <MergePlayersForm
            players={players.map((player) => ({
              id: player.id,
              name: player.name,
              colorSlot: player.colorSlot,
            }))}
          />
          <SignOutCard />
        </div>
      </div>
    </div>
  );
}
