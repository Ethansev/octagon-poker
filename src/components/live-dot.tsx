export function LiveDot() {
  return (
    <span aria-hidden className='relative flex size-2 shrink-0'>
      <span className='absolute inline-flex size-full animate-ping rounded-full bg-live opacity-75 motion-reduce:animate-none' />
      <span className='relative inline-flex size-2 rounded-full bg-live' />
    </span>
  );
}
