export type PaymentHandles = { venmoHandle: string | null; zelleHandle: string | null };

export type PaymentHandleField = 'venmo' | 'zelle';

export type ParsedPaymentHandles =
  | { kind: 'ok'; handles: PaymentHandles }
  | { kind: 'invalid'; field: PaymentHandleField };

const venmoPattern = /^[A-Za-z0-9_-]{1,30}$/;
const MAX_ZELLE_LENGTH = 80;

export function parsePaymentHandles(input: { venmo: string; zelle: string }): ParsedPaymentHandles {
  const venmo = input.venmo.trim().replace(/^@/, '');
  const zelle = input.zelle.trim();
  if (venmo !== '' && !venmoPattern.test(venmo)) return { kind: 'invalid', field: 'venmo' };
  if (zelle.length > MAX_ZELLE_LENGTH) return { kind: 'invalid', field: 'zelle' };
  return {
    kind: 'ok',
    handles: { venmoHandle: venmo === '' ? null : venmo, zelleHandle: zelle === '' ? null : zelle },
  };
}

export function venmoProfileUrl(handle: string): string {
  return `https://venmo.com/u/${encodeURIComponent(handle)}`;
}
