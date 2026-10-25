import { getViewer } from '@/access/viewer';
import { BackLink } from '@/app/(group)/back-link';
import { NewNightForm } from '@/app/(group)/nights/new/new-night-form';
import { NightHintsPanel } from '@/app/(group)/nights/new/night-hints-panel';
import { todayInGroup } from '@/dates/group-time';
import { centsToInput } from '@/money/money';
import { nightHints } from '@/nights/night-hints';
import { listNights } from '@/nights/nights';
import { notFound } from 'next/navigation';

export default async function NewNightPage() {
  const viewer = await getViewer();
  if (!viewer) notFound();

  const hints = nightHints(await listNights(viewer.group.id, 'all'));

  return (
    <div className='mx-auto max-w-[1360px] px-4 pt-5 pb-20 sm:px-6 lg:px-10 lg:pt-8'>
      <BackLink href='/'>Back home</BackLink>
      <div className='mt-5 grid gap-6 lg:mt-6 lg:grid-cols-12 lg:gap-8'>
        <section
          aria-labelledby='new-night-heading'
          className='rounded-panel bg-surface p-6 shadow-card sm:p-10 lg:col-span-7 lg:p-12'>
          <p className='text-xs font-extrabold tracking-[0.14em] text-ink-2 uppercase'>New night</p>
          <h1
            id='new-night-heading'
            className='mt-2 text-4xl leading-[1.02] font-bold tracking-tight text-balance sm:text-5xl'>
            Deal a new night
          </h1>
          <p className='mt-3 max-w-[48ch] text-base font-semibold text-ink-2'>
            Set the date and the spot. Seats come next, and everyone adds their own.
          </p>
          <div className='mt-8 border-t border-line pt-8'>
            <NewNightForm
              defaults={{
                date: todayInGroup(),
                location: '',
                buyIn: centsToInput(hints.last?.buyInCents ?? null),
              }}
              picks={hints.picks}
            />
          </div>
        </section>
        <aside aria-label='Before you deal' className='lg:col-span-5'>
          <NightHintsPanel hints={hints} />
        </aside>
      </div>
    </div>
  );
}
