import { brandActionClass, BrandCard, BrandScreen } from '@/components/brand-card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <BrandScreen>
      <BrandCard
        figure='404'
        title='Nothing at this table'
        body='That page folded, or it was never dealt. The season’s still going on the home page.'>
        <Link href='/' className={brandActionClass}>
          <ArrowLeft aria-hidden className='size-4' strokeWidth={3} />
          Back to the group
        </Link>
      </BrandCard>
    </BrandScreen>
  );
}
