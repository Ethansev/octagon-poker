import { trendGeometry } from '@/charts/trend-path';
import { cn } from '@/lib/utils';
import { formatNet } from '@/money/money';
import { formatShortNightDate } from '@/nights/dates';
import Link from 'next/link';

export type TrendNight = { nightId: string; date: string; netCents: number; won: boolean };

type TrendChartProps = {
  nights: TrendNight[];
  stroke: string;
  fill: string;
  className?: string;
};

const LABEL_GAP = 12;
const MAX_DOTS = 40;

type AxisLabel = { key: string; y: number; text: string; strong: boolean };

function axisLabels(zeroY: number, high: number, low: number): AxisLabel[] {
  const labels: AxisLabel[] = [{ key: 'zero', y: zeroY, text: '$0', strong: false }];
  if (high > 0 && zeroY >= LABEL_GAP) {
    labels.push({ key: 'high', y: 0, text: formatNet(high), strong: true });
  }
  if (low < 0 && 100 - zeroY >= LABEL_GAP) {
    labels.push({ key: 'low', y: 100, text: formatNet(low), strong: false });
  }
  return labels;
}

function summary(nights: TrendNight[], high: number, total: number): string {
  const count = `${nights.length} ${nights.length === 1 ? 'night' : 'nights'}`;
  const peak = high > 0 && high !== total ? `, peaking at ${formatNet(high)}` : '';
  return `Running total over ${count}: ${formatNet(total)}${peak}.`;
}

export function TrendChart({ nights, stroke, fill, className }: TrendChartProps) {
  const geometry = trendGeometry(nights.map((night) => night.netCents));
  if (!geometry) return null;
  const { points, zeroY, high, low } = geometry;
  const total = points[points.length - 1].total;
  const last = nights[nights.length - 1];
  const showDots = nights.length <= MAX_DOTS;
  const labels = axisLabels(zeroY, high, low);

  return (
    <figure className={cn('grid grid-cols-[auto_1fr] grid-rows-[1fr_auto] gap-x-3', className)}>
      <div aria-hidden className='relative'>
        {labels.map((label) => (
          <span
            key={label.key}
            className='invisible block h-0 overflow-hidden text-xs font-extrabold whitespace-nowrap tabular-nums'>
            {label.text}
          </span>
        ))}
        <div className='absolute inset-y-4 right-0'>
          {labels.map((label) => (
            <span
              key={label.key}
              className={cn(
                'absolute right-0 -translate-y-1/2 text-xs font-extrabold whitespace-nowrap tabular-nums',
                label.strong ? 'text-ink-2' : 'text-ink-3',
              )}
              style={{ top: `${label.y}%` }}>
              {label.text}
            </span>
          ))}
        </div>
      </div>
      <div role='img' aria-label={summary(nights, high, total)} className='relative'>
        <div className='absolute inset-x-2 inset-y-4'>
          <svg
            viewBox='0 0 100 100'
            preserveAspectRatio='none'
            aria-hidden
            className='absolute inset-0 size-full overflow-visible'>
            <path d={geometry.area} fill={fill} />
            <line
              x1={0}
              x2={100}
              y1={zeroY}
              y2={zeroY}
              stroke='currentColor'
              strokeOpacity={0.28}
              strokeDasharray='4 5'
              vectorEffect='non-scaling-stroke'
            />
            <path
              d={geometry.line}
              fill='none'
              stroke={stroke}
              strokeWidth={3.5}
              strokeLinecap='round'
              strokeLinejoin='round'
              vectorEffect='non-scaling-stroke'
            />
          </svg>
          {showDots &&
            nights.map((night, index) => {
              const point = points[index + 1];
              const isLast = index === nights.length - 1;
              return (
                <Link
                  key={night.nightId}
                  href={`/nights/${night.nightId}`}
                  aria-hidden
                  tabIndex={-1}
                  title={`${formatShortNightDate(night.date)} · ${formatNet(night.netCents)} · running ${formatNet(point.total)}`}
                  className={cn(
                    'absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border-[3px] border-frame transition hover:scale-125 motion-reduce:transition-none',
                    isLast ? 'size-5' : 'size-3.5',
                  )}
                  style={{
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                    background: night.won || isLast ? stroke : 'var(--surface-3)',
                    boxShadow: `0 0 0 1px ${stroke}`,
                  }}
                />
              );
            })}
        </div>
      </div>
      <figcaption
        aria-hidden
        className='col-start-2 mt-2 flex justify-between px-2 text-xs font-extrabold text-ink-3'>
        <span>Start</span>
        <span>{formatShortNightDate(last.date)}</span>
      </figcaption>
    </figure>
  );
}
