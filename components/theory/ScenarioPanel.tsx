import { MODELS, type EnzymeKey, type PositionKey } from "@/lib/structure/config";
import { EFFECT_STYLE, type Scenario } from "@/lib/theory/scenarios";
import type { ViewerReport } from "./MolstarViewer";

interface Props {
  scenario: Scenario;
  enzyme: EnzymeKey;
  report: ViewerReport | null;
}

export default function ScenarioPanel({ scenario, enzyme, report }: Props) {
  const model = MODELS[enzyme];
  const resistant = scenario.phenotype === "Resistant";
  const measured = (key: PositionKey) => report?.distances[key];

  return (
    <div className="space-y-4 text-sm" aria-live="polite">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold text-blue-950">{scenario.title}</h3>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
            resistant ? "bg-red-50 text-red-700 ring-red-200" : "bg-emerald-50 text-emerald-700 ring-emerald-200"}`}>
            {resistant ? "Cres" : "Csus"}
          </span>
        </div>
        <p className="mt-1 text-slate-700">{scenario.summary}</p>
      </div>

      <div className={`rounded-md border p-3 ${scenario.bridge.status === "intact"
        ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
        <div className={`text-xs font-semibold uppercase tracking-wide ${
          scenario.bridge.status === "intact" ? "text-emerald-800" : "text-red-800"}`}>
          Water-metal ion bridge: {scenario.bridge.status}
        </div>
        <p className="mt-1 text-slate-700">{scenario.bridge.text}</p>
      </div>

      <ul className="space-y-2">
        {scenario.effects.map((e) => {
          const style = EFFECT_STYLE[e.kind];
          const here = model.positions.find((p) => p.key === e.key);
          const m = measured(e.key);
          return (
            <li key={e.key} className={`rounded-md border p-2.5 ${here ? "border-slate-300" : "border-slate-100 opacity-80"}`}>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: style.css }} aria-hidden />
                <span className="font-medium text-slate-900">{e.label}</span>
                <span className="font-mono text-xs text-slate-600">{e.from} → {e.to}</span>
                <span className="ml-auto text-xs text-slate-500">{style.label}</span>
              </div>
              <p className="mt-1 text-slate-600">{e.text}</p>
              {here && m && (
                <p className="mt-1 text-xs text-slate-500">
                  In this model, {here.modelResidue} {m.residueAtom} is {m.distance.toFixed(1)} Å from {m.ion}.
                </p>
              )}
              {!here && <p className="mt-1 text-xs text-slate-400">Shown on the other enzyme.</p>}
            </li>
          );
        })}
      </ul>

      <p className="text-xs leading-relaxed text-slate-500">
        The 3D view shows the wild-type {model.organism} structure; variant side chains are not modelled. Colours mark what the grammar
        expects at each position. A water-mediated contact usually puts a residue oxygen roughly 4 to 5 Å from the metal, and
        waters are often not resolved at this resolution.
      </p>
    </div>
  );
}
