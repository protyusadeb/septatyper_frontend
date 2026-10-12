"use client";
import { useMemo, useState } from "react";
import type { Data, Layout } from "plotly.js";
import { Filters, fetchHabitatSeptatype } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import ChartCard, { Plot } from "./ChartCard";

const PALETTE = ["#0b2a5b", "#1f5fa8", "#4a90d9", "#8fbcea", "#2e9e6b", "#c0392b", "#e08e45", "#7b6cb0"];

export default function HabitatBarChart({ filters, top = 8 }: { filters: Filters; top?: number }) {
  const [percent, setPercent] = useState(false);
  const { data, loading, error } = useApi((s) => fetchHabitatSeptatype(filters, top, s), JSON.stringify([filters, top]));
  const rows = useMemo(() => data ?? [], [data]);

  const traces = useMemo(() => {
    const habitats = Array.from(new Set(rows.map((r) => r.habitat))).sort();
    const septatypes = Array.from(new Set(rows.map((r) => r.septatype))).sort((a, b) =>
      a === "Other" ? 1 : b === "Other" ? -1 : a.localeCompare(b),
    );
    return septatypes.map((s, i): Data => ({
      type: "bar",
      name: s,
      x: habitats,
      y: habitats.map((h) => rows.find((r) => r.habitat === h && r.septatype === s)?.n ?? 0),
      marker: { color: s === "Other" ? "#b8c0cc" : PALETTE[i % PALETTE.length] },
      hovertemplate: `<b>${s}</b><br>%{x}: %{y}<extra></extra>`,
    }));
  }, [rows]);

  const layout: Partial<Layout> = {
    barmode: "stack",
    barnorm: percent ? "percent" : undefined,
    margin: { t: 10, r: 10, b: 40, l: 50 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    yaxis: { title: { text: percent ? "% of isolates" : "Isolates" }, gridcolor: "#e5e9f0" },
    xaxis: { title: { text: "Habitat" } },
    legend: { orientation: "h", y: -0.25 },
  };

  const controls = (
    <div className="inline-flex overflow-hidden rounded-md border border-slate-300 text-xs">
      {[false, true].map((p) => (
        <button
          key={String(p)}
          type="button"
          onClick={() => setPercent(p)}
          className={`px-3 py-1.5 ${percent === p ? "bg-blue-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
        >
          {p ? "Percent" : "Count"}
        </button>
      ))}
    </div>
  );

  return (
    <ChartCard
      title="Septatype frequency by habitat"
      subtitle={`Top ${top} septatypes under the current filters; the rest grouped as Other`}
      controls={controls}
      loading={loading && !data}
      error={error}
      empty={rows.length === 0}
    >
      <Plot data={traces} layout={layout} config={{ displayModeBar: false, responsive: true }} style={{ width: "100%", height: 340 }} useResizeHandler />
    </ChartCard>
  );
}
