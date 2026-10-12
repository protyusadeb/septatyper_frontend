"use client";
import { useMemo, useState } from "react";
import ChoroplethMap from "@/components/charts/ChoroplethMap";
import HabitatBarChart from "@/components/charts/HabitatBarChart";
import FilterPanel from "@/components/FilterPanel";
import IsolateTable from "@/components/IsolateTable";
import { EMPTY_FILTERS, Filters, fetchFacets, fetchSummary } from "@/lib/api";
import { useApi, useDebounced } from "@/lib/useApi";

const pct = (v: number | null) => (v === null ? "n/a" : `${(v * 100).toFixed(1)}%`);

export default function BrowsePage() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  // Debounce so typing in the search box does not fire a request per keystroke.
  const debounced = useDebounced(filters, 350);

  const facets = useApi((s) => fetchFacets(s), "facets");
  const summary = useApi((s) => fetchSummary(debounced, s), JSON.stringify(debounced));
  const stats = useMemo(() => summary.data, [summary.data]);

  return (
    <main className="mx-auto max-w-[1400px] space-y-5 px-4 py-6">
      <header>
        <h1 className="text-2xl font-semibold text-blue-950">Browse isolates</h1>
        <p className="text-sm text-slate-600">
          Filter the repository, compare lab phenotype with BV-BRC and SeptaTyper predictions, and explore the geography
          and habitat distribution of septatypes.
        </p>
      </header>

      <FilterPanel filters={filters} facets={facets.data} onChange={setFilters} />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Matching isolates", stats ? stats.total.toLocaleString() : "…"],
          ["SeptaTyper accuracy", stats ? pct(stats.septatyper_accuracy) : "…"],
          ["BV-BRC accuracy", stats ? pct(stats.bvbrc_accuracy) : "…"],
          ["SeptaTyper-only correct", stats ? stats.septatyper_wins.toLocaleString() : "…"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
            <div className="text-xl font-semibold text-blue-950">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ChoroplethMap filters={debounced} />
        <HabitatBarChart filters={debounced} />
      </div>

      <IsolateTable filters={debounced} />
    </main>
  );
}
