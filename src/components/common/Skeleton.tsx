/** Loading placeholders. Skeletons hold the layout; spinners move it. */

export interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = 'h-6 w-full' }: SkeletonProps) {
  return <div data-component="skeleton" className={`animate-pulse bg-zinc-800 rounded ${className}`} />;
}

export function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <div data-component="skeleton-card" className="bg-zinc-900 border border-zinc-800 rounded-md p-4 space-y-2">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="animate-pulse bg-zinc-800 rounded h-4" style={{ width: `${92 - index * 14}%` }} />
      ))}
    </div>
  );
}
