'use client';

import { SettingsSection } from '@/app/(group)/settings/settings-section';
import { authClient } from '@/auth/auth-client';
import { Button } from '@/components/ui/button';
import { LogOut, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SignOutCard() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    await authClient.signOut();
    router.replace('/');
    router.refresh();
  }

  return (
    <SettingsSection
      id='account-heading'
      icon={UserRound}
      title='Host account'
      description='You’re signed in as the host on this device.'>
      <Button variant='outline' onClick={signOut} disabled={pending}>
        <LogOut aria-hidden />
        {pending ? 'Signing out…' : 'Sign out'}
      </Button>
    </SettingsSection>
  );
}
