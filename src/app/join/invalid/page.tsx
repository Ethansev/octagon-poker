import { JoinForm } from '@/access/join-form';
import { BrandCard, brandLinkClass, BrandScreen } from '@/components/brand-card';
import Link from 'next/link';

export default function InvalidJoinPage() {
  return (
    <BrandScreen>
      <BrandCard
        title='This link has gone stale'
        body='The host reset the group link. Enter the group password to get in.'
        footer={
          <Link href='/sign-in' className={brandLinkClass}>
            Hosting? Sign in
          </Link>
        }>
        <JoinForm />
      </BrandCard>
    </BrandScreen>
  );
}
