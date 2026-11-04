import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PaymentHandleField, PaymentHandles } from '@/players/payment-handles';

const fieldErrors: Record<PaymentHandleField, string> = {
  venmo: 'Just the username: letters, numbers, - or _, up to 30.',
  zelle: 'Use a phone number or email, up to 80 characters.',
};

export function PaymentFields({
  idPrefix,
  defaults,
  invalid,
}: {
  idPrefix: string;
  defaults: PaymentHandles;
  invalid: PaymentHandleField | null;
}) {
  return (
    <>
      <div className='flex flex-col gap-1.5'>
        <Label htmlFor={`${idPrefix}-venmo`}>Venmo</Label>
        <Input
          id={`${idPrefix}-venmo`}
          name='venmo'
          defaultValue={defaults.venmoHandle ?? ''}
          placeholder='@username'
          autoCapitalize='none'
          autoCorrect='off'
          autoComplete='off'
          spellCheck={false}
          aria-invalid={invalid === 'venmo'}
        />
        {invalid === 'venmo' && (
          <p role='alert' className='text-sm font-semibold text-error'>
            {fieldErrors.venmo}
          </p>
        )}
      </div>
      <div className='flex flex-col gap-1.5'>
        <Label htmlFor={`${idPrefix}-zelle`}>Zelle</Label>
        <Input
          id={`${idPrefix}-zelle`}
          name='zelle'
          defaultValue={defaults.zelleHandle ?? ''}
          placeholder='Phone or email'
          autoCapitalize='none'
          autoCorrect='off'
          autoComplete='off'
          spellCheck={false}
          aria-invalid={invalid === 'zelle'}
        />
        {invalid === 'zelle' && (
          <p role='alert' className='text-sm font-semibold text-error'>
            {fieldErrors.zelle}
          </p>
        )}
      </div>
    </>
  );
}
