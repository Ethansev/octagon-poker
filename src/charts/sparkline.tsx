import { sparklineGeometry } from '@/charts/sparkline-path';

export function Sparkline({
  nets,
  stroke,
  width = 120,
  height = 30,
}: {
  nets: number[];
  stroke: string;
  width?: number;
  height?: number;
}) {
  const geometry = sparklineGeometry(nets, width, height);
  if (!geometry) return <svg width={width} height={height} aria-hidden />;
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden
      className='overflow-visible'>
      <line
        x1={4}
        x2={width - 4}
        y1={geometry.zeroY}
        y2={geometry.zeroY}
        stroke='currentColor'
        strokeOpacity={0.18}
        strokeDasharray='3 4'
      />
      <path
        d={geometry.path}
        fill='none'
        stroke={stroke}
        strokeWidth={3}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <circle
        cx={geometry.end.x}
        cy={geometry.end.y}
        r={4}
        fill={stroke}
        stroke='var(--frame)'
        strokeWidth={2}
      />
    </svg>
  );
}
