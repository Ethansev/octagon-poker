'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { resetInviteAction } from '@/groups/actions';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

export function InviteLinkCard({ joinUrl }: { joinUrl: string }) {
  const [reset, setReset] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const current = reset ?? joinUrl;

  async function copy() {
    try {
      await navigator.clipboard.writeText(current);
      toast.success('Link copied.');
    } catch {
      toast.error("Couldn't copy. Select the link and copy it by hand.");
    }
  }

  function confirmReset() {
    startTransition(async () => {
      const result = await resetInviteAction();
      setReset(result.joinUrl);
      toast.success('New link ready.');
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Group link</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='flex gap-2'>
          <Input readOnly value={current} aria-label='Group link' />
          <Button variant='outline' onClick={copy}>
            Copy
          </Button>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant='ghost' size='sm' disabled={pending}>
              Reset link
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset the group link?</AlertDialogTitle>
              <AlertDialogDescription>
                Everyone using the old link loses edit access until they open the new one.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep it</AlertDialogCancel>
              <AlertDialogAction onClick={confirmReset}>Reset link</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
