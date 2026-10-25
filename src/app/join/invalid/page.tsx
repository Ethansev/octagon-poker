import { BrandCard, brandLinkClass, BrandScreen } from '@/components/brand-card';
import Link from 'next/link';

export default function InvalidJoinPage() {
  return (
    <BrandScreen>
      <BrandCard
        title='This link has gone stale'
        body='The host reset the group link. Ask them for a fresh one and you’re back at the table.'
        footer={
          <Link href='/sign-in' className={brandLinkClass}>
            Hosting? Sign in
          </Link>
        }
      />
    </BrandScreen>
  );
}
