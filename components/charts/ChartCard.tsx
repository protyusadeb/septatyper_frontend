"use client";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";

export const Plot = dynamic(() => import("./PlotlyChart"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

export function ChartSkeleton() {
  return <div className="h-80 animate-pulse rounded-md bg-slate-100" aria-label="Loading chart" />;
}

interface Props {
  title: string;
  subtitle?: string;
  controls?: ReactNode;
  loading: boolean;
  error: string | null;
  empty: boolean;
  children: ReactNode;
}

/** Shared frame: title, controls, and loading / error / empty states. */
export default function ChartCard({ title, subtitle, controls, loading, error, empty, children }: Props) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-blue-950">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        {controls}
      </header>
      {error ? (
        <div role="alert" className="flex h-80 items-center justify-center rounded-md bg-red-50 px-4 text-center text-sm text-red-700">
          Could not load chart data. {error}
        </div>
      ) : loading ? (
        <ChartSkeleton />
      ) : empty ? (
        <div className="flex h-80 items-center justify-center rounded-md bg-slate-50 text-sm text-slate-500">
          No data for the current filters.
        </div>
      ) : (
        children
      )}
    </section>
  );
}
