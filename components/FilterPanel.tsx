"use client";
import type { Facets, Filters } from "@/lib/api";
import { EMPTY_FILTERS } from "@/lib/api";
import MultiSelect from "./MultiSelect";

interface Props {
  filters: Filters;
  facets: Facets | null;
  onChange: (next: Filters) => void;
}

const selectCls = "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm";
const checkCls = "flex items-center gap-2 text-sm text-slate-700";

export default function FilterPanel({ filters, facets, onChange }: Props) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => onChange({ ...filters, [key]: value });
  const empty: never[] = [];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" aria-label="Filters">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={filters.q}
          onChange={(e) => set("q", e.target.value)}
          placeholder="Search Genome ID, genome name or isolate name…"
          className="min-w-[16rem] flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
        />
        <button
          type="button"
          onClick={() => onChange(EMPTY_FILTERS)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          Reset
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MultiSelect label="Species" options={facets?.species ?? empty} selected={filters.species} onChange={(v) => set("species", v)} />
        <MultiSelect label="Habitat" options={facets?.habitat ?? empty} selected={filters.habitat} onChange={(v) => set("habitat", v)} />
        <MultiSelect label="Sequence type" options={facets?.st ?? empty} selected={filters.st} onChange={(v) => set("st", v)} searchable />
        <MultiSelect label="Septatype" options={facets?.septatype ?? empty} selected={filters.septatype} onChange={(v) => set("septatype", v)} searchable />
        <MultiSelect label="Country" options={facets?.country ?? empty} selected={filters.country} onChange={(v) => set("country", v)} searchable />
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={facets?.year_min ?? 1900}
            max={facets?.year_max ?? 2100}
            value={filters.yearMin}
            onChange={(e) => set("yearMin", e.target.value)}
            placeholder={facets?.year_min ? `From ${facets.year_min}` : "Year from"}
            className={selectCls}
            aria-label="Year from"
          />
          <input
            type="number"
            inputMode="numeric"
            min={facets?.year_min ?? 1900}
            max={facets?.year_max ?? 2100}
            value={filters.yearMax}
            onChange={(e) => set("yearMax", e.target.value)}
            placeholder={facets?.year_max ? `To ${facets.year_max}` : "Year to"}
            className={selectCls}
            aria-label="Year to"
          />
        </div>
        <select className={selectCls} value={filters.labPhenotype} onChange={(e) => set("labPhenotype", e.target.value as Filters["labPhenotype"])} aria-label="Lab phenotype">
          <option value="">Lab phenotype: any</option>
          <option value="Resistant">Lab: Resistant</option>
          <option value="Susceptible">Lab: Susceptible</option>
        </select>
        <select className={selectCls} value={filters.bvbrcPrediction} onChange={(e) => set("bvbrcPrediction", e.target.value as Filters["bvbrcPrediction"])} aria-label="BV-BRC prediction">
          <option value="">BV-BRC prediction: any</option>
          <option value="Resistant">BV-BRC: Resistant</option>
          <option value="Susceptible">BV-BRC: Susceptible</option>
          <option value="No_call">BV-BRC: No call</option>
        </select>
        <select className={selectCls} value={filters.septatyperPrediction} onChange={(e) => set("septatyperPrediction", e.target.value as Filters["septatyperPrediction"])} aria-label="SeptaTyper prediction">
          <option value="">SeptaTyper prediction: any</option>
          <option value="Cres">SeptaTyper: Cres</option>
          <option value="Csus">SeptaTyper: Csus</option>
        </select>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-100 pt-3">
        <label className={checkCls}>
          <input type="checkbox" checked={filters.septatyperWins} onChange={(e) => set("septatyperWins", e.target.checked)} />
          <span><span className="text-amber-500">★</span> SeptaTyper correct, BV-BRC wrong or no call</span>
        </label>
        <label className={checkCls}>
          <input type="checkbox" checked={filters.bvbrcFailed} onChange={(e) => set("bvbrcFailed", e.target.checked)} />
          BV-BRC did not match lab
        </label>
        <label className={checkCls}>
          <input type="checkbox" checked={filters.septatyperCorrect} onChange={(e) => set("septatyperCorrect", e.target.checked)} />
          SeptaTyper matched lab
        </label>
      </div>
    </section>
  );
}
