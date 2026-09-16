/**
 * Toasts.
 *
 * Success only. An error is shown inline instead, because an error needs its
 * context beside the control that produced it while a toast drifts away without
 * it. Maximum three stack, four seconds each. State lives in memory only — no
 * storage of any kind.
 */

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Check, X } from 'lucide-react';

export interface ToastItem {
  id: number;
  message: string;
}

interface ToastContextValue {
  push: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ push: () => undefined });

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setItems((current) => [...current.slice(-2), { id, message }]);
    window.setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), 4000);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div data-component="toast-region" className="fixed right-4 top-4 z-[60] flex w-[320px] flex-col gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 shadow-xl"
          >
            <Check size={13} className="mt-0.5 shrink-0 text-green-400" aria-hidden="true" />
            <p className="flex-1 text-[13px] text-zinc-100">{item.message}</p>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setItems((current) => current.filter((row) => row.id !== item.id))}
              className="text-zinc-500 hover:text-zinc-100 transition-colors duration-150"
            >
              <X size={12} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
