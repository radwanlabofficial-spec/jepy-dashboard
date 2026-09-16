/**
 * Data table.
 *
 * Four states, not three. "There are no leads" and "no lead matches this filter"
 * have different fixes, so collapsing them into one empty state sends the
 * operator looking in the wrong place. Loading is a skeleton rather than a
 * spinner: a skeleton holds the layout, so the page stops jumping on every fetch.
 *
 * No zebra striping — hairlines already separate rows, and stripes add noise at
 * this density. Sorting is server-side only, so no column is sortable unless the
 * API supports it.
 */

import type { ReactNode } from 'react';
import ErrorState from './ErrorState';
import EmptyState from './EmptyState';
import Skeleton from './Skeleton';
import type { PresentedError } from '../../hooks/useErrorMessage';

export interface Column<T> {
  key: string;
  header: ReactNode;
  align?: 'left' | 'right';
  width?: string;
  render: (row: T) => ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  error?: PresentedError | null;
  onRetry?: () => void;
  /** Message for a genuinely empty dataset. */
  emptyTitle?: string;
  emptyHint?: ReactNode;
  /** True when a filter is active, which switches the empty state. */
  filtered?: boolean;
  filteredTitle?: string;
  filteredHint?: ReactNode;
  onClearFilters?: () => void;
  skeletonRows?: number;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
  dense?: boolean;
  /** Sticky headers need a scroll container with a bounded height. */
  maxHeight?: string;
}

export default function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  error = null,
  onRetry,
  emptyTitle = 'Nothing here yet',
  emptyHint,
  filtered = false,
  filteredTitle = 'No rows match these filters',
  filteredHint,
  onClearFilters,
  skeletonRows = 8,
  onRowClick,
  rowClassName,
  dense = false,
  maxHeight,
}: DataTableProps<T>) {
  const cellPad = dense ? 'px-2 py-1' : 'px-3 py-1.5';

  if (error) {
    return (
      <div className="p-3">
        <ErrorState error={error} onRetry={onRetry} />
      </div>
    );
  }

  if (loading) {
    return (
      <div data-component="data-table-loading">
        <table className="w-full">
          <thead>
            <tr className="bg-zinc-900">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`${cellPad} text-[10px] uppercase tracking-wide text-zinc-400 border-b border-zinc-800 ${
                    column.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: skeletonRows }).map((_, rowIndex) => (
              <tr key={`sk-${rowIndex}`} className="border-b border-zinc-800">
                {columns.map((column) => (
                  <td key={column.key} className={cellPad}>
                    <Skeleton className="h-3.5 w-full max-w-[120px]" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="p-3">
        {filtered ? (
          <EmptyState title={filteredTitle} hint={filteredHint} action={onClearFilters ? { label: 'Clear filters', onClick: onClearFilters } : undefined} />
        ) : (
          <EmptyState title={emptyTitle} hint={emptyHint} />
        )}
      </div>
    );
  }

  return (
    <div
      data-component="data-table"
      className={maxHeight ? 'overflow-y-auto overflow-x-auto' : 'overflow-x-auto'}
      style={maxHeight ? { maxHeight } : undefined}
    >
      <table className="w-full">
        <thead>
          <tr className="bg-zinc-900">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`${cellPad} sticky top-0 z-10 bg-zinc-900 text-[10px] uppercase tracking-wide text-zinc-400 border-b border-zinc-800 ${
                  column.align === 'right' ? 'text-right' : 'text-left'
                }`}
                style={column.width ? { width: column.width } : undefined}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`border-b border-zinc-800 transition-colors duration-150 ${
                onRowClick ? 'cursor-pointer hover:bg-zinc-800/50' : 'hover:bg-zinc-800/50'
              } ${rowClassName ? rowClassName(row) : ''}`}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`${cellPad} text-[13px] text-zinc-100 ${column.align === 'right' ? 'text-right' : ''}`}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
