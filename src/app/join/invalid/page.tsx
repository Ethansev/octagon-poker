import { OctagonMark } from '@/components/octagon-mark';

export default function InvalidJoinPage() {
  return (
    <main className='grid min-h-dvh place-items-center px-4 py-16'>
      <div className='w-full max-w-md rounded-panel bg-surface p-8 text-center shadow-card sm:p-10'>
        <OctagonMark className='mx-auto size-14 text-2xl' />
        <h1 className='mt-6 text-3xl font-extrabold tracking-tight text-balance'>
          This link doesn&apos;t work anymore
        </h1>
        <p className='mt-3 leading-relaxed text-ink-2'>
          The host reset it. Ask the group chat for the current one.
        </p>
      </div>
    </main>
  );
}
