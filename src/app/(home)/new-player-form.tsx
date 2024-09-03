'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
// import { toast } from '@/components/ui/use-toast';
import { NewPlayerInput } from '@/dal/player';
import { useHomeStore } from '@/store/home';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { submitNewPlayer } from '../actions/player-actions';

const FormSchema = z.object({
  // date: z.date({
  //   required_error: 'A date of birth is required.',
  // }),
  // buyIn: z
  //   .string({
  //     required_error: 'A buy-in amount is required.',
  //   })
  //   .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
  //     message: 'A buy-in amount must be greater than 0.',
  //   })
  //   .transform((val) => parseFloat(val)),
  first_name: z.string({
    required_error: 'A first name is required.',
  }),
  last_name: z.string(),
  username: z.string(),
});

export function NewPlayerForm() {
  const router = useRouter();
  const [isNewPlayerDialogOpen, setIsNewPlayerDialogOpen] = useHomeStore((state) => [
    state.isNewPlayerDialogOpen,
    state.setIsNewPlayerDialogOpen,
  ]);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      username: '',
    },
  });
  // TODO: add a loading state

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    // TODO: maybe make default 0 optional so it gets initialized in sql
    const newPlayerData: NewPlayerInput = {
      first_name: data.first_name,
      last_name: data.last_name,
      username: data.username,
      net_earnings: 0,
      biggest_win: 0,
      biggest_loss: 0,
      average_earnings_per_session: 0,
      win_rate: 0,
      games_played: 0,
    };

    const res = await submitNewPlayer(newPlayerData);

    if (res.success) {
      setIsNewPlayerDialogOpen(false);
      router.refresh();
      toast.success('Player has been added successfully');
    } else {
      toast.error('Error creating event');
    }

    // startTransition(async () => {
    //   const res = await submitNewPlayer(newPlayerData);

    //   if (res.success) {
    //     toast.success('Player has been added successfully');
    //   } else {
    //     toast.error('Error creating event');
    //   }
    // });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4'>
        <div className='mb-4 space-y-4'>
          <FormField
            control={form.control}
            name='first_name'
            render={({ field }) => (
              <FormItem className='flex flex-1 flex-col'>
                <FormLabel className=''>
                  First Name <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input type='text' className='w-full text-left' placeholder='' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='last_name'
            render={({ field }) => (
              <FormItem className='flex flex-1 flex-col'>
                <FormLabel className=''>Last Name</FormLabel>
                <FormControl>
                  <Input type='text' className='w-full text-left' placeholder='' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='username'
            render={({ field }) => (
              <FormItem className='flex flex-1 flex-col'>
                <FormLabel className=''>Username</FormLabel>
                <FormControl>
                  <Input type='text' className='w-full text-left' placeholder='' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type='submit' className='w-full'>
          Submit
        </Button>
      </form>
    </Form>
  );
}
