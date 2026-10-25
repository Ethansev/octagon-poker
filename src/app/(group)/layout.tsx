import { getViewer } from '@/access/viewer';
import { SiteHeader } from '@/app/(group)/site-header';
import { OctagonMark } from '@/components/octagon-mark';
import { ThemeToggle } from '@/theme/theme-toggle';
import Link from 'next/link';

function AskForTheLink() {
  return (
    <main className='relative grid min-h-dvh place-items-center px-4 py-16'>
      <div className='absolute top-4 right-4 sm:top-6 sm:right-6'>
        <ThemeToggle />
      </div>
      <div className='w-full max-w-md rounded-panel bg-surface p-8 text-center shadow-card sm:p-10'>
        <OctagonMark className='mx-auto size-14 text-2xl' />
        <h1 className='mt-6 text-3xl font-extrabold tracking-tight text-balance'>
          Ask for the group link
        </h1>
        <p className='mt-3 leading-relaxed text-ink-2'>
          This is the private record book for our home game. Open the link from the group chat and
          you&apos;re in.
        </p>
        <Link
          href='/sign-in'
          className='mt-8 inline-flex h-10 cursor-pointer items-center rounded-full px-4 text-sm font-bold text-ink-2 transition hover:bg-surface-3 hover:text-ink focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none'>
          Hosting? Sign in
        </Link>
      </div>
    </main>
  );
}

export default async function GroupLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();
  if (!viewer) return <AskForTheLink />;

  return (
    <>
      <SiteHeader viewer={viewer} />
      <main>{children}</main>
    </>
  );
}
