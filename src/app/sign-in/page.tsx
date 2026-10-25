import { SignInForm } from '@/app/sign-in/sign-in-form';
import { OctagonMark } from '@/components/octagon-mark';
import { ThemeToggle } from '@/theme/theme-toggle';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <main className='relative grid min-h-dvh place-items-center px-4 py-16'>
      <div className='absolute top-4 right-4 sm:top-6 sm:right-6'>
        <ThemeToggle />
      </div>
      <div className='w-full max-w-sm rounded-panel bg-surface p-7 shadow-card sm:p-9'>
        <Link
          href='/'
          aria-label='Back to the group'
          className='inline-block rounded-md focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none'>
          <OctagonMark />
        </Link>
        <h1 className='mt-5 text-2xl font-extrabold tracking-tight'>Owner sign in</h1>
        <p className='mt-1.5 text-sm text-ink-2'>For the host. Everyone else just uses the link.</p>
        <div className='mt-7'>
          <SignInForm />
        </div>
      </div>
    </main>
  );
}
