import { SignInForm } from '@/app/sign-in/sign-in-form';
import { BrandCard, brandLinkClass, BrandScreen } from '@/components/brand-card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <BrandScreen>
      <BrandCard
        title='Welcome back, host'
        body='Sign in to run the books. Everyone else just uses the group link.'
        footer={
          <Link href='/' className={brandLinkClass}>
            <ArrowLeft aria-hidden className='size-4' strokeWidth={3} />
            Back to the group
          </Link>
        }>
        <SignInForm />
      </BrandCard>
    </BrandScreen>
  );
}
