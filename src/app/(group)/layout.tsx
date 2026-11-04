import { JoinForm } from '@/access/join-form';
import { getViewer } from '@/access/viewer';
import { SiteHeader } from '@/app/(group)/site-header';
import { BrandCard, brandLinkClass, BrandScreen } from '@/components/brand-card';
import Link from 'next/link';

function AskForThePassword() {
  return (
    <BrandScreen>
      <BrandCard
        title='What’s the password?'
        body='This is the private record book for our home game. Ask the host if you don’t have it.'
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

export default async function GroupLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();
  if (!viewer) return <AskForThePassword />;

  return (
    <>
      <SiteHeader viewer={viewer} />
      <main>{children}</main>
    </>
  );
}
