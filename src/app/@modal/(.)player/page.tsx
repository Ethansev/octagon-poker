import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import Link from 'next/link';

export default function PlayerPage() {
  return (
    <Dialog defaultOpen>
      <DialogContent>
        <DialogTitle>testing this title</DialogTitle>
        <div>
          <Link href='/'>Home</Link>
        </div>
        <div>Player Page</div>
      </DialogContent>
    </Dialog>
  );
}
