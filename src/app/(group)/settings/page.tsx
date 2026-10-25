import { requireOwner } from '@/access/viewer';
import { InviteLinkCard } from '@/app/(group)/settings/invite-link-card';
import { MergePlayersForm } from '@/app/(group)/settings/merge-players-form';
import { RenameGroupForm } from '@/app/(group)/settings/rename-group-form';
import { SignOutCard } from '@/app/(group)/settings/sign-out-card';
import { env } from '@/env';
import { listPlayers } from '@/players/players';

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
