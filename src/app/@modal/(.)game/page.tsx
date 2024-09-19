import { Modal } from '@/components/modal';
import Link from 'next/link';

export default function GamePage() {
  return (
    <Modal title='testing this title'>
      <div>
        <Link href='/'>Home</Link>
      </div>
      <div>Game Page</div>
    </Modal>
  );
}
