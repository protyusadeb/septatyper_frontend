"use client";
import validation from "@/data/validation.json";
import { EMPTY_FILTERS, fetchSummary } from "@/lib/api";
import { useApi } from "@/lib/useApi";

const pct = (v: number | null | undefined, d = 1) => (v == null ? "n/a" : `${(v * 100).toFixed(d)}%`);

function Card({ label, value, sub, tone = "text-blue-950" }: { label: string; value: string; sub?: string; tone?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`text-3xl font-semibold ${tone}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

export default function ValidationDashboard() {
  const v = validation;
  const live = useApi((s) => fetchSummary(EMPTY_FILTERS, s), "validation-summary");
  const s = live.data;
  const q = v.qnr_override;
  const speciesLabel = (n: string) => n.replace(" subspecies I", "");

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border-2 border-blue-900 bg-blue-950 p-4 text-white shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="text-xs uppercase tracking-wide text-blue-200">Computational concordance</div>
          <div className="text-4xl font-semibold">&gt;97%</div>
          <div className="mt-1 text-sm text-blue-100">{pct(v.concordance)} of {v.n_isolates.toLocaleString()} isolates match the laboratory phenotype</div>
        </div>
        <Card label="Sensitivity" value={pct(v.sensitivity)} sub={`${v.confusion.tp.toLocaleString()} of ${(v.confusion.tp + v.confusion.fn).toLocaleString()} resistant isolates called Cres`} tone="text-red-700" />
        <Card label="Specificity" value={pct(v.specificity)} sub={`${v.confusion.tn.toLocaleString()} of ${(v.confusion.tn + v.confusion.fp).toLocaleString()} susceptible isolates called Csus`} tone="text-emerald-700" />
        <Card label="Rule-based" value="Per isolate" sub="Each genome is called by the two-tier grammar, not looked up from a frequency table" />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-2 text-sm font-semibold text-blue-950">Concordance by species</h3>
        <ul className="space-y-2">
          {v.by_species.map((r) => (
            <li key={r.species} className="grid grid-cols-[11rem_1fr_4rem] items-center gap-3 text-sm">
              <span className="italic text-slate-700">{speciesLabel(r.species)} <span className="not-italic text-xs text-slate-400">n={r.n}</span></span>
              <span className="h-2.5 overflow-hidden rounded bg-slate-100"><span className="block h-full bg-blue-800" style={{ width: `${r.concordance * 100}%` }} /></span>
              <span className="text-right font-medium">{pct(r.concordance)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-slate-500">
          Scored on the founding dataset, {v.source.toLowerCase()}. The grammar was developed with this dataset in view, so this is
          concordance rather than independent validation. {v.not_scored}.
        </p>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <h3 className="text-sm font-semibold text-amber-900">Expected variation: qnr-positive isolates that test susceptible</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-700">
          The qnr override changed {q.applied} isolates from a susceptible baseline to resistant: {q.lab_resistant} were resistant in the lab and {q.lab_susceptible} were
          susceptible (E. coli {q.lab_susceptible_by_species["Escherichia coli"]}, K. pneumoniae {q.lab_susceptible_by_species["Klebsiella pneumoniae"]}, S. enterica {q.lab_susceptible_by_species["Salmonella enterica subspecies I"]}). These
          are expected biological variation rather than engine errors. A qnr gene is detected from its sequence, so the call says nothing
          about how strongly it is expressed. The manuscript attributes such cases to the broader genetic context, including regulatory
          regions and compensatory mutations. Low or silenced qnr expression, which genome sequence cannot show, may also contribute.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-2 text-sm font-semibold text-blue-950">Head-to-head with BV-BRC computational predictions</h3>
        {live.loading && !s ? (
          <p className="text-sm text-slate-500">Loading live database figures…</p>
        ) : !s || s.septatyper_predicted === 0 ? (
          <p className="text-sm text-slate-600">
            Live figures appear once SeptaTyper predictions are stored in the database
            (<code className="rounded bg-slate-100 px-1">python -m scripts.backfill_predictions</code>) and BV-BRC predictions have been fetched by the ingestion script.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <Card label="SeptaTyper accuracy" value={pct(s.septatyper_accuracy)} sub={`${s.septatyper_predicted.toLocaleString()} isolates`} />
            <Card label="BV-BRC accuracy" value={pct(s.bvbrc_accuracy)} sub={`${s.bvbrc_predicted.toLocaleString()} with a call, ${s.bvbrc_no_call.toLocaleString()} no call`} />
            <Card label="SeptaTyper right, BV-BRC wrong or no call" value={s.septatyper_wins.toLocaleString()} sub="Marked with a gold star in the repository" tone="text-amber-600" />
          </div>
        )}
        {live.error && <p className="mt-2 text-xs text-red-700">Could not reach the API: {live.error}</p>}
      </div>
    </div>
  );
}
