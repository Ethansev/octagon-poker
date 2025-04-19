'use client';

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from '@/components/ui/chart';
import { Player } from '@/dal/player';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

const chartConfig = {
  net_earnings: {
    label: 'Earnings',
    color: '#2563eb',
  },
  biggest_win: {
    label: 'Biggest Win',
    color: '#60a5fa',
  },
} satisfies ChartConfig;

type Props = {
  playerData: Player[];
};

function CustomToolTip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className='rounded-md border border-gray-200 bg-white p-2'>
        <p className='pb-2 text-xs font-semibold text-gray-500'>{label}</p>
        <div className='flex flex-row space-x-4'>
          <p className='text-xs text-gray-500'>Net Earnings</p>
          <p className='font-bold'>${payload[0].value}</p>
        </div>
      </div>
    );
  }
}

export default function NetEarningsChart({ playerData }: Props) {
  console.log('playerData: ', playerData);
  return (
    <>
      <ChartContainer config={chartConfig}>
        <BarChart accessibilityLayer data={playerData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey='first_name'
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            // tickFormatter={(value) => value.slice(0, 3)}
          />
          <YAxis
            dataKey='net_earnings'
            tickLine={false}
            tickMargin={10}
            tickFormatter={(value) => `$${value}`}
          />
          <ChartTooltip content={<CustomToolTip />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey='net_earnings' fill='#2563eb' radius={2} />
          {/* <Bar dataKey='biggest_win' fill='#60a5fa' radius={2} /> */}
        </BarChart>
      </ChartContainer>

      {/* TODO: line chart will need each game session as its X-axis tick */}
      {/* TODO: I would need to fetch all game records for each player in the group and calculate cumulative net earnings after each session */}
    </>
  );
}
