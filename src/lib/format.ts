/**
 * Presentation-only formatters. All arithmetic on money happens on the integer
 * `cost_micro` value and is divided once, here, at display time (13 §7).
 */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Absolute local time, e.g. `27 Aug, 14:32`. */
export function formatTime(unix: number | null): string {
  if (unix === null || unix === undefined) return '—';
  const d = new Date(unix * 1000);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${hh}:${mm}`;
}

/** Absolute UTC, used in the tooltip beside every local time (cron runs in UTC). */
export function formatUtc(unix: number | null): string {
  if (unix === null || unix === undefined) return '—';
  return `${new Date(unix * 1000).toISOString().slice(0, 16).replace('T', ' ')} UTC`;
}

export function formatDay(unix: number): string {
  const d = new Date(unix * 1000);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** Compact relative recency, for recency columns only. */
export function relativeTime(unix: number | null, now = Date.now() / 1000): string {
  if (unix === null || unix === undefined) return '—';
  const sec = Math.max(0, Math.floor(now - unix));
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mo = Math.floor(day / 30);
  return `${mo}mo ago`;
}

export function formatDuration(sec: number | null): string {
  if (sec === null || sec === undefined) return '—';
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ${sec % 60}s`;
  return `${Math.floor(min / 60)}h ${min % 60}m`;
}

/** Money is always four decimals; null is a dash, never zero. */
export function formatMicro(micro: number | null, decimals = 4): string {
  if (micro === null || micro === undefined) return '—';
  return `$${(micro / 1_000_000).toFixed(decimals)}`;
}

export function formatMoney(cents: number | null): string {
  if (cents === null || cents === undefined) return '—';
  return `$${(cents / 100).toFixed(2)}`;
}

export function formatNumber(value: number | null): string {
  if (value === null || value === undefined) return '—';
  return value.toLocaleString('en-US');
}

export function formatPct(value: number | null, decimals = 1): string {
  if (value === null || value === undefined) return '—';
  return `${value.toFixed(decimals)}%`;
}

export function formatLatency(ms: number | null): string {
  if (ms === null || ms === undefined) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

/** `score_milli` is an integer thousandth; the UI shows one decimal. */
export function formatMilli(milli: number | null): string {
  if (milli === null || milli === undefined) return '—';
  return (milli / 1000).toFixed(1);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Suppression addresses are stored hashed; the UI only ever shows a mask. */
export function maskEmail(email: string | null): string {
  if (!email) return '—';
  const [local, domain] = email.split('@');
  if (!domain) return '••••';
  const head = local.slice(0, 1);
  return `${head}••••@${domain}`;
}
