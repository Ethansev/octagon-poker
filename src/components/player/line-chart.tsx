'use client';

import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { PlayerSession } from '@/dal/player-session';

// TODO: pass in props and use them
type Props = {
  className?: string;
  chartTitle?: string;
  chartDescription?: string;
  chartData?: PlayerSession[]; // TODO: x-axis = session date, y-axis = total net earnings
};

const chartData = [
  { month: 'January', desktop: 186 },
  { month: 'February', desktop: 305 },
  { month: 'March', desktop: 237 },
  { month: 'April', desktop: 73 },
  { month: 'May', desktop: 209 },
  { month: 'June', desktop: 214 },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export default function LineChartComponent({
  className,
  chartTitle,
  chartDescription,
  // chartData,
}: Props) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>
          {chartTitle} <span className='text-green-500'> $100</span>
        </CardTitle>
        <CardDescription>{chartDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='month'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Line
              dataKey='desktop'
              type='natural'
              stroke='var(--color-desktop)'
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      {/* <CardFooter className='flex-col items-start gap-2 text-sm'> */}
      {/*   <div className='flex gap-2 font-medium leading-none'> */}
      {/*     Trending up by 5.2% this month <TrendingUp className='h-4 w-4' /> */}
      {/*   </div> */}
      {/*   <div className='text-muted-foreground leading-none'> */}
      {/*     Showing total visitors for the last 6 months */}
      {/*   </div> */}
      {/* </CardFooter> */}
    </Card>
  );
}
