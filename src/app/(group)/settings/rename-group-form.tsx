'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { renameGroupAction } from '@/groups/actions';
import { useTransition, type FormEvent } from 'react';
import { toast } from 'sonner';

export function RenameGroupForm({ name }: { name: string }) {
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await renameGroupAction(form);
      if (result.kind === 'saved') toast.success('Group renamed.');
      else toast.error('Enter a name up to 60 characters.');
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Group name</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className='flex gap-2'>
          <Input name='name' defaultValue={name} maxLength={60} aria-label='Group name' required />
          <Button type='submit' disabled={pending}>
            Save
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
