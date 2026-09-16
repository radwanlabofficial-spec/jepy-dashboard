/**
 * Numbers.
 *
 * Always monospace and always right-aligned: the operator compares columns, and
 * proportional digits of differing width make a column look ragged. A null value
 * renders an en dash, never a zero — "quota exhausted" and "quota unknown" are
 * different facts, and the same distinction runs through the whole score model.
 */

import type { ReactNode } from 'react';

export interface NumProps {
  value: number | null | undefined;
  /** Renders the value. Defaults to a plain locale string. */
  format?: (value: number) => string;
  unit?: ReactNode;
  /** Diminishing value, e.g. a muted unit or a secondary suffix. */
  mutedZero?: boolean;
  className?: string;
  title?: string;
}

export default function Num({ value, format, unit, mutedZero = false, className = '', title }: NumProps) {
  const empty = value === null || value === undefined;
  const text = empty ? '—' : (format ? format(value) : value.toLocaleString('en-US'));
  const muted = empty || (mutedZero && value === 0);
  return (
    <span
      data-component="num"
      title={title ?? (empty ? 'unknown — not zero' : undefined)}
      className={`font-mono text-right tabular-nums ${muted ? 'text-zinc-500' : ''} ${className}`}
    >
      {text}
      {unit ? <span className="ml-1 text-zinc-500">{unit}</span> : null}
    </span>
  );
}
