'use client';

import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from './ui/dialog';

type Props = {
  children: React.ReactNode;
  title: string;
};

export function Modal({ children, title }: Props) {
  const router = useRouter();

  function handleOpenChange() {
    router.back();
  }

  return (
    <Dialog defaultOpen={true} onOpenChange={handleOpenChange}>
      <DialogOverlay className='bg-black/50'>
        <DialogContent className='max-w-2xl'>
          <DialogTitle>{title}</DialogTitle>
          {children}
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  );
}
