import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type CopyState = { kind: 'idle' } | { kind: 'copied' };

const COPIED_FOR_MS = 2000;

export function useCopyLink(link: string) {
  const [state, setState] = useState<CopyState>({ kind: 'idle' });

  useEffect(() => {
    if (state.kind !== 'copied') return;
    const timer = setTimeout(() => setState({ kind: 'idle' }), COPIED_FOR_MS);
    return () => clearTimeout(timer);
  }, [state]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setState({ kind: 'copied' });
    } catch {
      toast.error("Couldn't copy. Select the link and copy it by hand.");
    }
  }

  return { state, copy };
}
