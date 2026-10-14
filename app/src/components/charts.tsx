import { MASTERY_THRESHOLD } from '../lib/bkt';

const C = { grid: '#ECE8E1', axis: '#B9B3A8', text: '#6B675F', teal: '#0F5F5A', brick: '#A2402C', ink: '#1C1B19' };

/**
 * Mastery trajectory. values[0] is P(L) before the first attempt; values[i] is P(L) after attempt i.
 * outcomes[i-1] says whether attempt i was correct.
 */
export function TraceChart({
  values, outcomes, height = 260, width = 760, showValues, startLabel = 'Start',
}: { values: number[]; outcomes: boolean[]; height?: number; width?: number; showValues?: boolean; startLabel?: string }) {
  const W = width, H = height, L = 44, R = 18, T = 22, B = 34, PAD = 18;
  const n = Math.max(values.length - 1, 1);
  const x = (i: number) => L + PAD + (i / n) * (W - L - R - PAD);
  const y = (v: number) => T + (1 - v) * (H - T - B);
  const labelsEvery = n > 24 ? Math.ceil(n / 12) : 1;
  const showVals = showValues ?? values.length <= 12;
  const pts = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full select-none" role="img" aria-label="Mastery probability after each attempt">
      {[0, 0.25, 0.5, 0.75, 1].map((g) => (
        <g key={g}>
          <line x1={L} x2={W - R} y1={y(g)} y2={y(g)} stroke={g === 0 ? C.axis : C.grid} />
          <text x={L - 8} y={y(g) + 4} textAnchor="end" fontSize="11" fill={C.text} fontFamily="IBM Plex Mono">{g.toFixed(2)}</text>
        </g>
      ))}
      <line x1={L} x2={W - R} y1={y(MASTERY_THRESHOLD)} y2={y(MASTERY_THRESHOLD)} stroke={C.teal} strokeDasharray="4 4" />
      <text x={L + 6} y={y(MASTERY_THRESHOLD) - 5} textAnchor="start" fontSize="10.5" fill={C.teal} fontFamily="IBM Plex Mono">threshold 0.95</text>
      {values.map((_, i) => (i % labelsEvery === 0 || i === n) && (
        <text key={i} x={x(i)} y={H - 12} textAnchor="middle" fontSize="11" fill={C.text} fontFamily="IBM Plex Mono">{i === 0 ? startLabel : i}</text>
      ))}
      {values.length > 1 && <polyline points={pts} fill="none" stroke="#8C877E" strokeWidth={1.5} strokeLinejoin="round" />}
      {values.map((v, i) => {
        const o = i === 0 ? null : outcomes[i - 1];
        const fill = o === null ? '#FFFFFF' : o ? C.teal : C.brick;
        return (
          <g key={i}>
            <circle cx={x(i)} cy={y(v)} r={i === values.length - 1 ? 5.5 : 4.2} fill={fill} stroke={o === null ? '#8C877E' : '#FFFFFF'} strokeWidth={1.5} />
            {showVals && (
              <text x={x(i)} y={y(v) - 10} textAnchor="middle" fontSize="10.5" fill={C.ink} fontFamily="IBM Plex Mono">{v >= 0.995 && v < 1 ? '0.99+' : v.toFixed(2)}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function DayBars({ days }: { days: { label: string; count: number }[] }) {
  const W = 280, H = 120, B = 20, T = 16;
  const max = Math.max(4, ...days.map((d) => d.count));
  const bw = 24, gap = (W - bw * days.length) / (days.length + 1);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="Attempts per day">
      <line x1="0" x2={W} y1={H - B} y2={H - B} stroke={C.axis} />
      {days.map((d, i) => {
        const h = (d.count / max) * (H - B - T);
        const x0 = gap + i * (bw + gap);
        return (
          <g key={i}>
            <rect x={x0} y={H - B - Math.max(h, d.count ? 2 : 1.5)} width={bw} height={Math.max(h, d.count ? 2 : 1.5)} rx="2" fill={d.count ? C.teal : '#D3CEC4'} />
            <text x={x0 + bw / 2} y={H - B - h - 4} textAnchor="middle" fontSize="10" fill={C.ink} fontFamily="IBM Plex Mono">{d.count}</text>
            <text x={x0 + bw / 2} y={H - 5} textAnchor="middle" fontSize="10" fill={C.text} fontFamily="IBM Plex Mono">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}
