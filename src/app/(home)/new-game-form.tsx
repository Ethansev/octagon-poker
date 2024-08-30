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
// import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { NewGameInput } from '@/types';
import { toast } from 'sonner';
import { addNewGame } from '../actions/actions-index';

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
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const newGameData: NewGameInput = {
      // TODO: fix date format on client or server?
      // date: new Date(data.date).toISOString().split('T')[0],
      date: data.date,
      buy_in: data.buyIn,
      game_group_id: 1,
    };

    console.log('data send to addNewGame: ', newGameData);
    const res = await addNewGame(newGameData);

    if (res.success === true) {
      toast.success('Event has been created');
    } else {
      toast.error('Error creating event');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4'>
        <div className='flex flex-row gap-4'>
          <FormField
            control={form.control}
            name='date'
            render={({ field }) => (
              <FormItem className='flex flex-1 flex-col'>
                <FormLabel>Session Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground',
                        )}>
                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                        <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
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
                <FormLabel className='m-0'>Buy-In</FormLabel>
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
