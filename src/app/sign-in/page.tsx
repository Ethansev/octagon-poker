import { SignInForm } from '@/app/sign-in/sign-in-form';

export default function SignInPage() {
  return (
    <div className='mx-auto flex max-w-sm flex-col gap-6 p-8'>
      <h1 className='text-2xl font-semibold'>Owner sign in</h1>
      <SignInForm />
    </div>
  );
}
