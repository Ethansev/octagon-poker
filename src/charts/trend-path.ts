export type TrendPoint = { x: number; y: number; total: number };

export type TrendGeometry = {
  points: TrendPoint[];
  line: string;
  area: string;
  zeroY: number;
  high: number;
  low: number;
};

export function runningTotals(nets: number[]): number[] {
  return nets.reduce<number[]>((acc, net) => [...acc, (acc.at(-1) ?? 0) + net], [0]);
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export function trendGeometry(nets: number[]): TrendGeometry | null {
  if (nets.length === 0) return null;
  const totals = runningTotals(nets);
  const high = Math.max(...totals);
  const low = Math.min(...totals);
  const span = high - low;
  const y = (value: number) => (span === 0 ? 50 : round((1 - (value - low) / span) * 100));
  const points = totals.map((total, index) => ({
    x: round((index / (totals.length - 1)) * 100),
    y: y(total),
    total,
  }));
  const line = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`)
    .join(' ');
  const zeroY = y(0);
  return {
    points,
    line,
    area: `${line} L100 ${zeroY} L0 ${zeroY} Z`,
    zeroY,
    high,
    low,
  };
}
