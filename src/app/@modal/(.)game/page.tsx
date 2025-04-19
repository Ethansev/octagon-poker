'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function GamePage() {
  const router = useRouter();

  return (
    <Dialog defaultOpen onOpenChange={(open) => !open && router.back()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>testing this title</DialogTitle>
        </DialogHeader>
        <div>
          <Link href='/'>Home</Link>
        </div>
        <div>Game Page</div>
      </DialogContent>
    </Dialog>
  );
}
