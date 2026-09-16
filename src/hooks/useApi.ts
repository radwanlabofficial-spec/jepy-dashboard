/**
 * A deliberately small data-fetching hook.
 *
 * It reproduces the three behaviours the UI contract actually needs — a stale
 * window, an opt-in polling interval, and invalidation after a mutation — with
 * none of the machinery of a full query library. Only two surfaces poll (Jobs at
 * 10s and the Overview queue/credit cards at 30s); everything else refetches on
 * mount or on an explicit refresh.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiFailure } from '../lib/api';

interface CacheEntry {
  at: number;
  data: unknown;
}

const cache = new Map<string, CacheEntry>();

/** Drop cached entries so the next mount refetches. Prefix match, or everything. */
export function invalidate(prefix?: string): void {
  if (!prefix) {
    cache.clear();
    return;
  }
  for (const key of Array.from(cache.keys())) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}

export interface QueryOptions {
  /** How long a cached value is considered fresh. */
  staleTime?: number;
  /** Poll interval in milliseconds. Omit for no polling. */
  pollMs?: number;
  enabled?: boolean;
}

export interface QueryResult<T> {
  data: T | null;
  error: ApiFailure | null;
  loading: boolean;
  refreshing: boolean;
  refetch: () => void;
}

export function useQuery<T>(key: string, run: () => Promise<T>, options: QueryOptions = {}): QueryResult<T> {
  const { staleTime = 30_000, pollMs, enabled = true } = options;
  const [data, setData] = useState<T | null>(() => {
    const hit = cache.get(key);
    return hit ? (hit.data as T) : null;
  });
  const [error, setError] = useState<ApiFailure | null>(null);
  const [loading, setLoading] = useState<boolean>(() => !cache.has(key));
  const [refreshing, setRefreshing] = useState(false);
  const [tick, setTick] = useState(0);
  const runRef = useRef(run);
  runRef.current = run;

  const load = useCallback(
    async (isBackground: boolean) => {
      if (isBackground) setRefreshing(true);
      else setLoading(true);
      try {
        const result = await runRef.current();
        cache.set(key, { at: Date.now(), data: result });
        setData(result);
        setError(null);
      } catch (caught) {
        setError(caught instanceof ApiFailure ? caught : new ApiFailure({ code: 'E_INTERNAL', message: String(caught) }));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [key],
  );

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    const hit = cache.get(key);
    const fresh = hit && Date.now() - hit.at < staleTime;
    if (hit && !fresh) setData(hit.data as T);
    if (!fresh) void load(Boolean(hit));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled, tick, staleTime]);

  useEffect(() => {
    if (!enabled || !pollMs) return undefined;
    const timer = window.setInterval(() => void load(true), pollMs);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled, pollMs]);

  const refetch = useCallback(() => setTick((value) => value + 1), []);

  return { data, error, loading, refreshing, refetch };
}

export interface MutationResult<TArgs extends unknown[], TResult> {
  run: (...args: TArgs) => Promise<TResult | null>;
  data: TResult | null;
  error: ApiFailure | null;
  loading: boolean;
  reset: () => void;
}

export function useMutation<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  options: { invalidatePrefix?: string; onSuccess?: (result: TResult) => void; onError?: (error: ApiFailure) => void } = {},
): MutationResult<TArgs, TResult> {
  const { invalidatePrefix, onSuccess, onError } = options;
  const [data, setData] = useState<TResult | null>(null);
  const [error, setError] = useState<ApiFailure | null>(null);
  const [loading, setLoading] = useState(false);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const run = useCallback(
    async (...args: TArgs): Promise<TResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await fnRef.current(...args);
        setData(result);
        if (invalidatePrefix) invalidate(invalidatePrefix);
        onSuccess?.(result);
        return result;
      } catch (caught) {
        const failure = caught instanceof ApiFailure ? caught : new ApiFailure({ code: 'E_INTERNAL', message: String(caught) });
        setError(failure);
        onError?.(failure);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [invalidatePrefix, onSuccess, onError],
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { run, data, error, loading, reset };
}
