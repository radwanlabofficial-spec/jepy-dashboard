/**
 * Tabs — underline style.
 *
 * The active underline is the second of the five permitted uses of the brand
 * green ("you are here"). Pills are not used: in a console where every status is
 * already a pill, a tab that looks like a pill is read as a state, not as
 * navigation.
 */

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  disabled?: boolean;
  /** Explains a disabled tab, e.g. a gated feature. */
  title?: string;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

export default function Tabs({ items, value, onChange, className = '' }: TabsProps) {
  return (
    <div data-component="tabs" className={`flex items-center gap-1 border-b border-zinc-800 ${className}`} role="tablist">
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={item.disabled}
            title={item.title}
            onClick={() => {
              if (!item.disabled) onChange(item.id);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-2 border-b-2 text-[13px] transition-colors duration-150 focus-visible:ring-1 focus-visible:ring-green-400 ${
              active
                ? 'text-zinc-100 border-green-400'
                : 'text-zinc-400 border-transparent hover:text-zinc-100'
            } ${item.disabled ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            {item.label}
            {item.count !== undefined ? <span className="font-mono text-[10px] text-zinc-500">{item.count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
