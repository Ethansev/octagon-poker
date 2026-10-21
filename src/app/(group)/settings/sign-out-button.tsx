'use client';

import { authClient } from '@/auth/auth-client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    await authClient.signOut();
    router.replace('/');
    router.refresh();
  }

  return (
    <Button variant='outline' onClick={signOut} disabled={pending}>
      Sign out
    </Button>
  );
}
