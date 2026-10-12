"use client";
import { useEffect, useRef, useState } from "react";

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface Settled<T> {
  key: string;
  data: T | null;
  error: string | null;
}

/**
 * Runs `fn` whenever `key` changes and cancels the previous request.
 * The previous result stays in `data` while the next one loads, so tables do not flash empty.
 */
export function useApi<T>(fn: (signal: AbortSignal) => Promise<T>, key: string): ApiState<T> {
  const [settled, setSettled] = useState<Settled<T> | null>(null);
  const fnRef = useRef(fn);

  useEffect(() => {
    fnRef.current = fn;
  });

  useEffect(() => {
    const ctrl = new AbortController();
    fnRef
      .current(ctrl.signal)
      .then((data) => setSettled({ key, data, error: null }))
      .catch((e: unknown) => {
        if (ctrl.signal.aborted) return;
        setSettled((prev) => ({
          key,
          data: prev?.data ?? null,
          error: e instanceof Error ? e.message : String(e),
        }));
      });
    return () => ctrl.abort();
  }, [key]);

  const current = settled?.key === key;
  return {
    data: settled?.data ?? null,
    loading: !current,
    error: current ? settled.error : null,
  };
}

export function useDebounced<T>(value: T, ms = 350): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}
