export type SparklineGeometry = {
  path: string;
  zeroY: number;
  end: { x: number; y: number };
};

export function sparklineGeometry(
  nets: number[],
  width: number,
  height: number,
  pad = 4,
): SparklineGeometry | null {
  if (nets.length < 2) return null;
  const series = nets.reduce<number[]>((acc, net) => [...acc, (acc.at(-1) ?? 0) + net], [0]);
  const min = Math.min(...series);
  const span = Math.max(...series) - min || 1;
  const y = (value: number) => pad + (1 - (value - min) / span) * (height - pad * 2);
  const points = series.map((value, index) => ({
    x: pad + (index / (series.length - 1)) * (width - pad * 2),
    y: y(value),
  }));
  return {
    path: points
      .map(
        (point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`,
      )
      .join(' '),
    zeroY: y(0),
    end: points[points.length - 1],
  };
}
