import { requireOwner } from '@/access/viewer';
import { InviteLinkCard } from '@/app/(group)/settings/invite-link-card';
import { MergePlayersForm } from '@/app/(group)/settings/merge-players-form';
import { RenameGroupForm } from '@/app/(group)/settings/rename-group-form';
import { SignOutButton } from '@/app/(group)/settings/sign-out-button';
import { env } from '@/env';
import { listPlayers } from '@/players/players';

export default async function SettingsPage() {
  const viewer = await requireOwner();
  const players = await listPlayers(viewer.group.id);
  const joinUrl = `${env.BETTER_AUTH_URL}/join/${viewer.group.inviteCode}`;

  return (
    <div className='mx-auto max-w-2xl space-y-6 p-4'>
      <h1 className='text-2xl font-semibold'>Settings</h1>
      <InviteLinkCard joinUrl={joinUrl} />
      <RenameGroupForm name={viewer.group.name} />
      <MergePlayersForm players={players.map((p) => ({ id: p.id, name: p.name }))} />
      <SignOutButton />
    </div>
  );
}
