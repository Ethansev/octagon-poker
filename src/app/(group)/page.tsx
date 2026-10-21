import { getViewer } from '@/access/viewer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function Home() {
  const viewer = await getViewer();
  if (!viewer) notFound();

  return (
    <div className='flex items-center justify-between p-4'>
      <h1 className='text-xl font-extrabold text-slate-900'>Octagon Poker</h1>
      <Button asChild>
        <Link href='/nights/new'>Log a night</Link>
      </Button>
    </div>
  );
}
