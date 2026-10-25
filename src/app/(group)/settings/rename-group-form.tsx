'use client';

import { SettingsSection } from '@/app/(group)/settings/settings-section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { renameGroupAction } from '@/groups/actions';
import { PenLine } from 'lucide-react';
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
    <SettingsSection
      id='group-name-heading'
      icon={PenLine}
      title='Group name'
      description='Shows up in the header for everyone.'>
      <form onSubmit={onSubmit} className='flex flex-col gap-2 sm:flex-row'>
        <Input
          name='name'
          defaultValue={name}
          maxLength={60}
          aria-labelledby='group-name-heading'
          required
        />
        <Button type='submit' disabled={pending} className='h-11 sm:px-6'>
          {pending ? 'Saving…' : 'Save'}
        </Button>
      </form>
    </SettingsSection>
  );
}
