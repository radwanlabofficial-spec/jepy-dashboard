/** Loading placeholders. Skeletons hold the layout; spinners move it. */

export interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = 'h-6 w-full' }: SkeletonProps) {
  return (
    <div
      data-component="skeleton"
      className={`animate-pulse rounded ${className}`}
      style={{ background: 'var(--border-soft, #e5e7eb)' }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <div
      data-component="skeleton-card"
      className="space-y-2 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--panel)] p-4"
    >
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded h-4"
          style={{ width: `${92 - index * 14}%`, background: 'var(--border-soft, #e5e7eb)' }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
