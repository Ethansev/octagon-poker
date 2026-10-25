'use client';

import { BrandCard, brandActionClass, brandLinkClass } from '@/components/brand-card';
import { RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function GroupError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <div className='grid place-items-center px-4 py-16 sm:px-6 sm:py-24'>
      <BrandCard
        title='Something went wrong'
        body='The table got bumped and we lost the hand. Give it another shot.'>
        <div className='flex flex-wrap items-center gap-2'>
          <button type='button' onClick={retry} className={brandActionClass}>
            <RotateCcw aria-hidden className='size-4' strokeWidth={2.5} />
            Try again
          </button>
          <Link href='/' className={brandLinkClass}>
            Back to the group
          </Link>
        </div>
      </BrandCard>
    </div>
  );
}
