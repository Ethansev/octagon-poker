import Link from 'next/link';

export default function GameIDPage({ params }: { params: { id: string } }) {
  return (
    <>
      <div>
        <Link href='/'>Home</Link>
      </div>
      <div>Game ID Page {params.id}</div>
    </>
  );
}
