/**
 * Status pill.
 *
 * The success statuses are deliberately NEUTRAL: a table where every row is
 * green hides the three broken rows the operator opened it to find, and 38 green
 * pills drown the one green primary button. Success is therefore a zinc pill
 * with a 5px green dot; only exceptions carry colour.
 *
 * Every variant is a full literal class string. A class name assembled at runtime
 * from a hue variable is invisible to the Tailwind scanner, so it never reaches
 * the stylesheet and the component renders colourless with no console error. The
 * project's CI gate greps for that shape and must return nothing.
 */

const PILL: Record<string, string> = {
  // success — neutral pill, green dot (see DOT)
  ok: 'bg-zinc-800 text-zinc-400 border-zinc-700',
  active: 'bg-zinc-800 text-zinc-400 border-zinc-700',
  done: 'bg-zinc-800 text-zinc-400 border-zinc-700',
  valid: 'bg-zinc-800 text-zinc-400 border-zinc-700',
  closed: 'bg-zinc-800 text-zinc-400 border-zinc-700',
  // in flight
  running: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  claimed: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  pending: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  queued: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  // needs attention
  untested: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  stale: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  rate_limited: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  degraded: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  warn: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  provisional: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  // broken
  exhausted: 'bg-red-500/15 text-red-400 border-red-500/30',
  failed: 'bg-red-500/15 text-red-400 border-red-500/30',
  invalid: 'bg-red-500/15 text-red-400 border-red-500/30',
  revoked: 'bg-red-500/15 text-red-400 border-red-500/30',
  broken: 'bg-red-500/15 text-red-400 border-red-500/30',
  open: 'bg-red-500/15 text-red-400 border-red-500/30',
  error: 'bg-red-500/15 text-red-400 border-red-500/30',
  // intentionally off — not broken
  disabled: 'bg-zinc-800 text-zinc-500 border-zinc-800',
  blocked: 'bg-zinc-800 text-zinc-500 border-zinc-800',
  manual: 'bg-zinc-800 text-zinc-500 border-zinc-800',
  empty: 'bg-zinc-800 text-zinc-500 border-zinc-800',
  none: 'bg-zinc-800 text-zinc-500 border-zinc-800',
  // informational
  info: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
};

/** Only these five statuses carry the healthy dot. The dot IS the "healthy" mark. */
const DOT = new Set(['ok', 'active', 'done', 'valid', 'closed']);

export interface StatusPillProps {
  status: string;
  /** Overrides the printed label without changing the mapped colour. */
  label?: string;
  title?: string;
}

export default function StatusPill({ status, label, title }: StatusPillProps) {
  const classes = PILL[status] ?? PILL.disabled;
  if (!PILL[status] && typeof console !== 'undefined') {
    console.warn(`StatusPill: unmapped status "${status}" rendered as disabled`);
  }
  return (
    <span
      data-component="status-pill"
      title={title ?? status}
      className={`inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded border text-[10px] font-medium ${classes}`}
    >
      {DOT.has(status) ? <i className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" aria-hidden="true" /> : null}
      {label ?? status}
    </span>
  );
}

export { PILL as STATUS_PILL_CLASSES, DOT as STATUS_DOT_SET };
