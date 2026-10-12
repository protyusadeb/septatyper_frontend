"use client";
import { useState } from "react";
import type { Data, Layout } from "plotly.js";
import { Filters, fetchCountryStats } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import ChartCard, { Plot } from "./ChartCard";

type Metric = "resistant" | "count";

export default function ChoroplethMap({ filters }: { filters: Filters }) {
  const [metric, setMetric] = useState<Metric>("resistant");
  const { data, loading, error } = useApi((s) => fetchCountryStats(filters, s), JSON.stringify(filters));
  const rows = data ?? [];

  const hover = rows.map(
    (r) =>
      `<b>${r.country ?? r.iso3}</b><br>${r.n_isolates.toLocaleString()} isolates<br>` +
      `${r.n_resistant.toLocaleString()} resistant (${(r.resistant_fraction * 100).toFixed(1)}%)`,
  );

  const trace: Partial<Data> = {
    type: "choropleth",
    locations: rows.map((r) => r.iso3),
    locationmode: "ISO-3",
    z: rows.map((r) => (metric === "resistant" ? r.resistant_fraction * 100 : Math.log10(r.n_isolates))),
    text: hover,
    hoverinfo: "text",
    colorscale: metric === "resistant"
      ? [[0, "#2e9e6b"], [0.5, "#f3e9c6"], [1, "#c0392b"]]
      : [[0, "#e8f0fb"], [1, "#0b2a5b"]],
    zmin: metric === "resistant" ? 0 : undefined,
    zmax: metric === "resistant" ? 100 : undefined,
    marker: { line: { color: "#ffffff", width: 0.5 } },
    colorbar:
      metric === "resistant"
        ? { title: { text: "% resistant" }, thickness: 12 }
        : { title: { text: "Isolates" }, thickness: 12, tickvals: [0, 1, 2, 3], ticktext: ["1", "10", "100", "1000"] },
  } as Partial<Data>;

  const layout: Partial<Layout> = {
    margin: { t: 0, r: 0, b: 0, l: 0 },
    paper_bgcolor: "rgba(0,0,0,0)",
    geo: { projection: { type: "natural earth" }, showframe: false, showcoastlines: false, bgcolor: "rgba(0,0,0,0)" },
  };

  const controls = (
    <div className="inline-flex overflow-hidden rounded-md border border-slate-300 text-xs">
      {(["resistant", "count"] as Metric[]).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => setMetric(m)}
          className={`px-3 py-1.5 ${metric === m ? "bg-blue-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
        >
          {m === "resistant" ? "% resistant" : "Isolate count"}
        </button>
      ))}
    </div>
  );

  return (
    <ChartCard
      title="Geographic distribution"
      subtitle="Lab-confirmed ciprofloxacin resistance by country of isolation"
      controls={controls}
      loading={loading && !data}
      error={error}
      empty={rows.length === 0}
    >
      <Plot data={[trace as Data]} layout={layout} config={{ displayModeBar: false, responsive: true }} style={{ width: "100%", height: 340 }} useResizeHandler />
    </ChartCard>
  );
}
