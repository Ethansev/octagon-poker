import { Modal } from '@/components/modal';
import Link from 'next/link';

export default function PlayerPage() {
  return (
    <Modal title='testing this title'>
      <div>
        <Link href='/'>Home</Link>
      </div>
      <div>Player Page</div>
    </Modal>
  );
}
