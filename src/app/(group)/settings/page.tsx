import { requireOwner } from '@/access/viewer';
import { env } from '@/env';
import { listPlayers } from '@/players/players';
import { InviteLinkCard } from './invite-link-card';
import { MergePlayersForm } from './merge-players-form';
import { RenameGroupForm } from './rename-group-form';
import { SignOutButton } from './sign-out-button';

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
