import { getViewer } from '@/access/viewer';
import { NewNightForm } from '@/app/(group)/nights/new/new-night-form';
import { todayInGroup } from '@/dates/group-time';
import { notFound } from 'next/navigation';

export default async function NewNightPage() {
  const viewer = await getViewer();
  if (!viewer) notFound();

  return (
    <div className='mx-auto max-w-md space-y-6 p-4 pt-8'>
      <div>
        <h1 className='text-xl font-extrabold text-ink'>Log a night</h1>
        <p className='mt-1 text-sm text-ink-2'>Add the players on the next page.</p>
      </div>
      <NewNightForm today={todayInGroup()} />
    </div>
  );
}
