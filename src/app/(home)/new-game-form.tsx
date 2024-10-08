'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ISODateString, NewGameInput } from '@/dal/game';
import { cn } from '@/lib/utils';
import { useHomeStore } from '@/store/home';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { submitNewGame } from '../actions/game-actions';

const FormSchema = z.object({
  date: z.date({
    required_error: 'A date of birth is required.',
  }),
  buyIn: z
    .string({
      required_error: 'A buy-in amount is required.',
    })
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'A buy-in amount must be greater than 0.',
    })
    .transform((val) => parseFloat(val)),
});

export function NewGameForm() {
  const router = useRouter();
  const [isNewGameDialogOpen, setIsNewGameDialogOpen] = useHomeStore((state) => [
    state.isNewGameDialogOpen,
    state.setIsNewGameDialogOpen,
  ]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
  // TODO: add a loading state

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    // Convert date to SQL date format
    // TODO: move this to a helper function and validate the date using regex
    const newDate = data.date.toISOString().split('T')[0] as ISODateString;
    const isValidDate = (newDate: string) => /^\d{4}-\d{2}-\d{2}$/.test(newDate);
    if (!isValidDate(newDate)) {
      toast.error('Invalid date');
      return;
    }

    const newGameData: NewGameInput = {
      date: newDate,
      buy_in: data.buyIn,
      game_group_id: 1,
    };

    const res = await submitNewGame(newGameData);

    if (res.success === true && res.game) {
      setIsNewGameDialogOpen(false);
      router.push(`/game/${res.game.id}`);
      toast.success('Event has been created');
    } else {
      toast.error('Error creating event');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4'>
        <div className='mb-4 space-y-4'>
          <FormField
            control={form.control}
            name='date'
            render={({ field }) => (
              <FormItem className='flex flex-1 flex-col'>
                <FormLabel>
                  Session Date <span className='text-red-500'>*</span>
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'flex w-full items-center justify-start pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground',
                        )}>
                        <CalendarIcon className='mr-2 h-4 w-4 opacity-50' />
                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date: Date) => date > new Date() || date < new Date('1900-01-01')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {/* <FormDescription>Your date of birth is used to calculate your age.</FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='buyIn'
            render={({ field }) => (
              <FormItem className='flex flex-1 flex-col'>
                <FormLabel className='m-0'>
                  Buy-In <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <div className='relative'>
                    <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'>
                      $
                    </span>
                    <Input
                      type='number'
                      className='w-full pl-8 text-left'
                      placeholder='Enter buy-in amount'
                      {...field}
                    />
                  </div>
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
