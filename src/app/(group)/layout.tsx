import { JoinLinkForm } from '@/access/join-link-form';
import { getViewer } from '@/access/viewer';
import { SiteHeader } from '@/app/(group)/site-header';
import { BrandCard, brandLinkClass, BrandScreen } from '@/components/brand-card';
import Link from 'next/link';

function AskForTheLink() {
  return (
    <BrandScreen>
      <BrandCard
        title='Ask for the group link'
        body='This is the private record book for our home game. Open the link from the group chat, or paste it here.'
        footer={
          <Link href='/sign-in' className={brandLinkClass}>
            Hosting? Sign in
          </Link>
        }>
        <JoinLinkForm />
      </BrandCard>
    </BrandScreen>
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
