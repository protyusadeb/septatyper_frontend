"use client";
import { useState } from "react";
import { LabBadge } from "@/components/benchmark";
import { LabPhenotype } from "@/lib/api";
import { clearToken, useToken } from "@/lib/auth";
import { QueueQuery, fetchQueue } from "@/lib/submissions";
import { useApi } from "@/lib/useApi";
import FlagBadge from "./FlagBadge";
import LoginForm from "./LoginForm";
import SubmissionDetailPanel from "./SubmissionDetailPanel";

function Queue() {
  const [q, setQ] = useState<QueueQuery>({ status: "all", novel: false, mismatch: false, page: 1, pageSize: 25 });
  const [reload, setReload] = useState(0);
  const [openId, setOpenId] = useState<number | null>(null);
  const { data, loading, error } = useApi((s) => fetchQueue(q, s), JSON.stringify([q, reload]));
  const pages = data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1;
  const upd = (patch: Partial<QueueQuery>) => setQ({ ...q, page: 1, ...patch });

  const cards: [string, number | undefined, string][] = [
    ["Needs review", data?.counts.needs_review, "text-amber-700"],
    ["Clean, awaiting approval", data?.counts.pending, "text-blue-950"],
    ["Analysis failed", data?.counts.failed, "text-red-700"],
  ];

  return (
    <main className="mx-auto max-w-[1300px] space-y-5 px-4 py-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-blue-950">Curation queue</h1>
          <p className="text-sm text-slate-600">Check the flags, then approve to publish or reject with a reason.</p>
        </div>
        <button type="button" onClick={clearToken} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">Sign out</button>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map(([label, n, tone]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
            <div className={`text-2xl font-semibold ${tone}`}>{n ?? "…"}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm">
        <select value={q.status} onChange={(e) => upd({ status: e.target.value as QueueQuery["status"] })} className="rounded border border-slate-300 px-2 py-1.5" aria-label="Status">
          <option value="all">All open</option><option value="needs_review">Needs review</option><option value="pending">Clean</option>
        </select>
        <label className="flex items-center gap-2"><input type="checkbox" checked={q.novel} onChange={(e) => upd({ novel: e.target.checked })} /> Novel septatype</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={q.mismatch} onChange={(e) => upd({ mismatch: e.target.checked })} /> Phenotype mismatch</label>
        <button type="button" onClick={() => setReload((r) => r + 1)} className="ml-auto rounded border border-slate-300 px-3 py-1.5 hover:bg-slate-50">Refresh</button>
      </div>

      {error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className={`overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm ${loading ? "opacity-60" : ""}`}>
        <table className="w-full border-collapse text-sm">
          <thead className="bg-blue-950 text-left text-xs uppercase tracking-wide text-blue-50">
            <tr>{["#", "Submitted", "Isolate", "Species / habitat", "Lab", "SeptaTyper", "Septatype", "Flags"].map((h) => <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody>
            {data?.items.map((s) => (
              <tr key={s.submission_id} onClick={() => setOpenId(s.submission_id)} tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") setOpenId(s.submission_id); }}
                className={`cursor-pointer border-b border-slate-100 align-top hover:bg-blue-50/40 ${s.status === "needs_review" ? "shadow-[inset_3px_0_0_#d97706]" : ""}`}>
                <td className="px-3 py-2.5 font-mono">{s.submission_id}</td>
                <td className="px-3 py-2.5 whitespace-nowrap">{s.created_at ? new Date(s.created_at).toLocaleDateString() : "—"}</td>
                <td className="px-3 py-2.5">
                  <div>{s.isolate_name ?? "—"}</div>
                  <div className="truncate text-xs text-slate-500">{s.bv_brc_name_fetched ?? s.bv_brc_id_supplied ?? ""}</div>
                </td>
                <td className="px-3 py-2.5"><div className="italic">{s.declared_species}</div><div className="text-xs text-slate-500">{s.habitat}, {s.country} {s.collection_year}</div></td>
                <td className="px-3 py-2.5">{s.experimental_phenotype && <LabBadge value={s.experimental_phenotype as LabPhenotype} />}</td>
                <td className={`px-3 py-2.5 font-medium ${s.septatyper_prediction === "Cres" ? "text-red-700" : s.septatyper_prediction === "Csus" ? "text-emerald-700" : "text-slate-400"}`}>{s.septatyper_prediction ?? "—"}</td>
                <td className="px-3 py-2.5 font-mono text-xs">{s.predicted_septatype_string ?? "—"}</td>
                <td className="px-3 py-2.5"><div className="flex max-w-xs flex-wrap gap-1">{s.flags.filter((f) => f.severity === "review").map((f) => <FlagBadge key={f.code} flag={f} />)}</div></td>
              </tr>
            ))}
            {data && data.items.length === 0 && <tr><td colSpan={8} className="px-3 py-10 text-center text-slate-500">Nothing waiting for review.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-2 text-sm">
        <button type="button" disabled={q.page <= 1} onClick={() => setQ({ ...q, page: q.page - 1 })} className="rounded border border-slate-300 px-3 py-1 disabled:opacity-40">Prev</button>
        <span className="text-slate-600">Page {q.page} of {pages}</span>
        <button type="button" disabled={q.page >= pages} onClick={() => setQ({ ...q, page: q.page + 1 })} className="rounded border border-slate-300 px-3 py-1 disabled:opacity-40">Next</button>
      </div>

      {openId !== null && (
        <SubmissionDetailPanel key={openId} id={openId} onClose={() => setOpenId(null)}
          onDone={() => { setOpenId(null); setReload((r) => r + 1); }} />
      )}
    </main>
  );
}

export default function CuratorDashboard() {
  const token = useToken();
  return token ? <Queue /> : <LoginForm />;
}
