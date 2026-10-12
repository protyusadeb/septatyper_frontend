"use client";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { MODELS, type EnzymeKey, type PositionKey } from "@/lib/structure/config";
import { EFFECT_STYLE, SCENARIOS, type EffectKind } from "@/lib/theory/scenarios";
import type { ViewerReport } from "./MolstarViewer";
import ScenarioPanel from "./ScenarioPanel";

const MolstarViewer = dynamic(() => import("./MolstarViewer"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-slate-100" aria-label="Loading viewer" />,
});

export default function StructuralExplorer() {
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const [enzyme, setEnzyme] = useState<EnzymeKey>("gyrase");
  const [report, setReport] = useState<ViewerReport | null>(null);

  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];
  const model = MODELS[enzyme];
  const effects = useMemo(() => {
    const out: Partial<Record<PositionKey, EffectKind>> = {};
    scenario.effects.forEach((e) => { if (model.positions.some((p) => p.key === e.key)) out[e.key] = e.kind; });
    return out;
  }, [scenario, model]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Tetratype to display">
        {SCENARIOS.map((s) => {
          const active = s.id === scenarioId;
          const resistant = s.phenotype === "Resistant";
          return (
            <button key={s.id} type="button" aria-pressed={active} onClick={() => setScenarioId(s.id)}
              className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                active
                  ? resistant ? "border-red-700 bg-red-700 text-white" : "border-emerald-700 bg-emerald-700 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}>
              {s.button}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div>
          <div className="mb-2 inline-flex overflow-hidden rounded-md border border-slate-300 text-sm" role="tablist" aria-label="Enzyme">
            {(Object.keys(MODELS) as EnzymeKey[]).map((k) => (
              <button key={k} type="button" role="tab" aria-selected={enzyme === k} onClick={() => setEnzyme(k)}
                className={`px-3 py-1.5 ${enzyme === k ? "bg-blue-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
                {MODELS[k].protein}
              </button>
            ))}
          </div>

          <div className="relative h-[480px] overflow-hidden rounded-lg border border-slate-200 bg-white">
            <MolstarViewer model={model} effects={effects} onReport={setReport} />
            {report?.state === "loading" && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/70 text-sm text-slate-600">
                Loading {model.pdbId} from the PDB…
              </div>
            )}
            {report?.state === "error" && (
              <div role="alert" className="absolute inset-0 flex items-center justify-center bg-white p-6 text-center text-sm text-red-700">
                The structure could not be loaded ({report.message}). Check your connection, or set NEXT_PUBLIC_GYRASE_MODEL_URL /
                NEXT_PUBLIC_TOPOIV_MODEL_URL to a local file.
              </div>
            )}
          </div>

          {report?.issues.map((i) => (
            <p key={i} role="alert" className="mt-2 rounded bg-amber-50 p-2 text-xs text-amber-900">{i}</p>
          ))}
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            Reference model:{" "}
            <a className="text-blue-800 hover:underline" href={`https://www.rcsb.org/structure/${model.pdbId}`} target="_blank" rel="noopener noreferrer">
              PDB {model.pdbId}
            </a>
            , {model.organism} {model.protein.split(" ")[0]} with {model.drug} and DNA ({model.resolution}). {model.note}
          </p>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600" aria-label="Colour legend">
            {Object.values(EFFECT_STYLE).map((s) => (
              <li key={s.label} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.css }} aria-hidden />{s.label}
              </li>
            ))}
          </ul>
        </div>

        <ScenarioPanel scenario={scenario} enzyme={enzyme} report={report} />
      </div>
    </div>
  );
}
