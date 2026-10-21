import { getViewer } from '@/access/viewer';
import Link from 'next/link';

export default async function GroupLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();

  if (!viewer) {
    return (
      <div className='mx-auto max-w-md p-8'>
        <h1 className='text-2xl font-semibold'>Ask for the group link</h1>
        <p className='text-muted-foreground mt-2'>
          This is a private page for our home game. Open the link from the group chat to get in.
        </p>
        <Link href='/sign-in' className='text-muted-foreground mt-4 inline-block text-sm underline'>
          Hosting? Sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <header className='flex items-center justify-between border-b px-4 py-3'>
        <Link href='/' className='font-semibold'>
          {viewer.group.name}
        </Link>
        {viewer.role === 'owner' ? (
          <Link href='/settings' className='text-sm underline'>
            Settings
          </Link>
        ) : (
          <Link href='/sign-in' className='text-sm underline'>
            Sign in
          </Link>
        )}
      </header>
      {children}
    </div>
  );
}
