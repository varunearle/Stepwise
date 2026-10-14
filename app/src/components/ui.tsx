import type { ReactNode } from 'react';
import { MASTERY_THRESHOLD, STATUS_LABEL, type Status } from '../lib/bkt';

// BKT never reaches exactly 1, so values that would round to 1.00 are shown as 0.99+.
export const f2 = (x: number) => (x >= 0.995 && x < 1 ? '0.99+' : x.toFixed(2));
export const f3 = (x: number) => x.toFixed(3);
export const signed = (x: number) => (x >= 0 ? '+' : '−') + Math.abs(x).toFixed(2);

const dtf = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
export const when = (ms: number) => dtf.format(new Date(ms));
export const longDate = (ms: number) =>
  new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(ms));

export const STATUS_TEXT: Record<Status, string> = {
  mastered: 'text-teal',
  learning: 'text-amber-text',
  'needs-work': 'text-brick',
  'not-started': 'text-muted',
};
export const STATUS_BAR: Record<Status, string> = {
  mastered: 'bg-teal',
  learning: 'bg-amber',
  'needs-work': 'bg-brick',
  'not-started': 'bg-line2',
};
const STATUS_CHIP: Record<Status, string> = {
  mastered: 'border-teal/50 text-teal bg-teal-soft/60',
  learning: 'border-amber/50 text-amber-text bg-amber-soft/60',
  'needs-work': 'border-brick/50 text-brick bg-brick-soft/60',
  'not-started': 'border-line2 text-muted bg-sunk',
};

export function StatusChip({ s }: { s: Status }) {
  return <span className={`chip ${STATUS_CHIP[s]}`}>{STATUS_LABEL[s]}</span>;
}

export function MasteryBar({ value, s, height = 'h-2' }: { value: number; s: Status; height?: string }) {
  return (
    <div className="relative w-full" aria-label={`Mastery ${f2(value)}`}>
      <div className={`${height} w-full overflow-hidden rounded-sm bg-sunk border border-line/60`}>
        <div className={`h-full ${STATUS_BAR[s]} transition-[width] duration-500`} style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }} />
      </div>
      <div className="absolute -top-1 -bottom-1 w-px bg-ink/50" style={{ left: `${MASTERY_THRESHOLD * 100}%` }} title="Mastery threshold 0.95" />
    </div>
  );
}

export function PageHeader({ eyebrow, title, sub, right }: { eyebrow?: string; title: string; sub?: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 border-b border-line pb-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <div className="eyebrow mb-1">{eyebrow}</div>}
        <h1 className="font-serif text-[28px] font-semibold leading-9 tracking-tight">{title}</h1>
        {sub && <p className="mt-0.5 text-muted">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function CardTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-3 border-b border-line pb-3">
      <h2 className="font-serif text-lg font-semibold">{children}</h2>
      {right}
    </div>
  );
}

// Minimal C++ highlighting: keywords, numbers, strings. Enough for short fragments.
const KW = /\b(int|bool|for|while|if|return|true|false|nullptr|struct|string|stack|queue|cout|max|swap|Node)\b/;
export function Code({ src }: { src: string }) {
  const parts = src.split(/(\b(?:int|bool|for|while|if|return|true|false|nullptr|struct|string|stack|queue|cout|max|swap|Node)\b|"[^"]*"|\b\d+\b)/g);
  return (
    <pre className="overflow-x-auto rounded border border-line bg-sunk p-3 font-mono text-[13px] leading-5 text-ink">
      <code>
        {parts.map((p, i) =>
          KW.test(p) && /^\w+$/.test(p) ? <span key={i} className="text-teal font-medium">{p}</span>
            : /^"/.test(p) ? <span key={i} className="text-brick">{p}</span>
              : /^\d+$/.test(p) ? <span key={i} className="text-amber-text">{p}</span>
                : p,
        )}
      </code>
    </pre>
  );
}

/** Renders text with `inline code` segments. */
export function Rich({ text }: { text: string }) {
  return <>{text.split(/(`[^`]+`)/g).map((s, i) => (s.startsWith('`') ? <code key={i} className="code-inline">{s.slice(1, -1)}</code> : s))}</>;
}

// ---------------------------------------------------------------- icons (1.5px stroke, 18px)
const paths: Record<string, ReactNode> = {
  dashboard: <><rect x="3" y="3" width="7" height="8" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="15" width="7" height="6" /></>,
  practice: <><path d="M4 5h16v11H4z" /><path d="M8 20h8M12 16v4" /><path d="M8 9l2 2-2 2M12 13h4" /></>,
  progress: <><path d="M4 20V4" /><path d="M4 20h16" /><path d="M7 15l4-4 3 3 5-6" /></>,
  class: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><path d="M16 5.5a3 3 0 010 5.5M18 14.5c1.8.9 3 2.9 3 5.5" /></>,
  model: <><circle cx="6" cy="6" r="2.2" /><circle cx="18" cy="6" r="2.2" /><circle cx="6" cy="18" r="2.2" /><circle cx="18" cy="18" r="2.2" /><path d="M8.2 6h7.6M6 8.2v7.6M18 8.2v7.6M8.2 18h7.6" /></>,
  settings: <><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  cross: <path d="M6 6l12 12M18 6L6 18" />,
  download: <><path d="M12 4v11M7 10l5 5 5-5" /><path d="M5 20h14" /></>,
  out: <><path d="M14 4h5v16h-5" /><path d="M10 8l-4 4 4 4M6 12h10" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  chevron: <path d="M7 10l5 5 5-5" />,
  reset: <><path d="M4 12a8 8 0 1 0 2.4-5.7" /><path d="M4 4v4h4" /></>,
};
export function Icon({ name, className = 'h-[18px] w-[18px]' }: { name: keyof typeof paths | string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {paths[name]}
    </svg>
  );
}
