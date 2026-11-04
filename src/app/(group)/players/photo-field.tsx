'use client';

import { removePlayerPhotoAction, savePlayerPhotoAction } from '@/players/actions';
import { PlayerAvatar } from '@/players/player-avatar';
import { usePlayerPhoto } from '@/players/player-photos-context';
import type { Contact } from '@/players/players';
import { Camera } from 'lucide-react';
import { useRef, useTransition, type ChangeEvent } from 'react';
import { toast } from 'sonner';

const PHOTO_SIZE = 320;
const JPEG_QUALITY = 0.85;

async function squareJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = PHOTO_SIZE;
  canvas.height = PHOTO_SIZE;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('No canvas');
  context.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    PHOTO_SIZE,
    PHOTO_SIZE,
  );
  bitmap.close();
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('No image'))),
      'image/jpeg',
      JPEG_QUALITY,
    );
  });
}

export function PhotoField({ contact }: { contact: Contact }) {
  const input = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const hasPhoto = usePlayerPhoto(contact.name) !== undefined;

  function onPick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    startTransition(async () => {
      try {
        const form = new FormData();
        form.set('photo', await squareJpeg(file), 'photo.jpg');
        const result = await savePlayerPhotoAction(contact.id, form);
        if (result.kind === 'saved') toast.success('Photo saved.');
        else toast.error('That photo didn’t work. Try another one.');
      } catch {
        toast.error('Couldn’t read that image. Try a JPEG or PNG.');
      }
    });
  }

  function remove() {
    startTransition(() => removePlayerPhotoAction(contact.id));
  }

  return (
    <div className='flex items-center gap-4'>
      <PlayerAvatar colorSlot={contact.colorSlot} name={contact.name} size={64} />
      <div className='flex flex-wrap gap-2'>
        <input
          ref={input}
          type='file'
          accept='image/*'
          aria-label={`Photo of ${contact.name}`}
          onChange={onPick}
          className='sr-only'
          tabIndex={-1}
        />
        <button
          type='button'
          disabled={pending}
          onClick={() => input.current?.click()}
          className='inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-line px-4 text-sm font-extrabold transition hover:bg-surface-2 focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60'>
          <Camera aria-hidden className='size-4' />
          {pending ? 'Saving…' : hasPhoto ? 'Change photo' : 'Add photo'}
        </button>
        {hasPhoto && (
          <button
            type='button'
            disabled={pending}
            onClick={remove}
            className='inline-flex h-10 cursor-pointer items-center rounded-full px-3 text-sm font-bold text-ink-2 transition hover:bg-surface-2 hover:text-ink focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60'>
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
