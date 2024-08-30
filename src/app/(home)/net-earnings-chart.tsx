'use client';

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Player } from '@/types';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

// const chartData = [
//   { month: 'January', desktop: 186, mobile: 80 },
//   { month: 'February', desktop: 305, mobile: 200 },
//   { month: 'March', desktop: 237, mobile: 120 },
//   { month: 'April', desktop: 73, mobile: 190 },
//   { month: 'May', desktop: 209, mobile: 130 },
//   { month: 'June', desktop: 214, mobile: 140 },
// ];

const chartConfig = {
  // desktop: {
  //   label: 'Desktop',
  //   icon: Monitor,
  //   color: '#2563eb',
  // },
  // mobile: {
  //   label: 'Mobile',
  //   color: '#60a5fa',
  // },
  net_earnings: {
    label: 'Net Earnings',
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
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey='net_earnings' fill='#2563eb' radius={2} />
          {/* <Bar dataKey='biggest_win' fill='#60a5fa' radius={2} /> */}
        </BarChart>
      </ChartContainer>

      {/* TODO: line chart will need each game session as its X-axis tick */}
      {/* TODO: I would need to fetch all game records for each player in the group and calculate cumulative net earnings after each session */}
      {/* <ChartContainer config={chartConfig}>
        <LineChart data={playerData}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey='first_name' tickLine={false} tickMargin={10} axisLine={false} />
          <YAxis
            dataKey='net_earnings'
            tickLine={false}
            tickMargin={10}
            tickFormatter={(value) => `$${value}`}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line dataKey='net_earnings' stroke='#2563eb' />
        </LineChart>
      </ChartContainer> */}
    </>
  );
}
