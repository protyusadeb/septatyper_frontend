"use client";
import { useState } from "react";
import { LabBadge } from "@/components/benchmark";
import { LabPhenotype } from "@/lib/api";
import { approveSubmission, fetchDetail, rejectSubmission } from "@/lib/submissions";
import { useApi } from "@/lib/useApi";
import FlagBadge from "./FlagBadge";

const RULES: Record<string, string> = {
  qnr_present: "qnrB2 or qnrS1 present",
  sonnei_recN_L346F: "S. sonnei S-D-S-E with RecN-346 F",
  enterica_recN_ctg: "S. enterica F-D-S-E with RecN-346 ctg",
  sonnei_single_vote_override: "S. sonnei single-vote tetratype (L-D-S-E or S-Y-S-E)",
};
const ORDER = ["gyrA_83", "gyrA_87", "parC_80", "parC_84", "recN_346"];

interface Props { id: number; onClose: () => void; onDone: () => void }

export default function SubmissionDetailPanel({ id, onClose, onDone }: Props) {
  const { data: d, loading, error } = useApi((s) => fetchDetail(id, s), String(id));
  const [notes, setNotes] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const reviewFlags = d?.flags.filter((f) => f.severity === "review") ?? [];
  const canApprove = !!d && d.analysis_state === "done" && !!d.predicted_septatype_string && (reviewFlags.length === 0 || confirm);

  const act = async (kind: "approve" | "reject") => {
    if (!d) return;
    if (kind === "reject" && notes.trim().length < 3) return setMsg({ ok: false, text: "Add a short reason for rejecting." });
    setBusy(kind);
    setMsg(null);
    try {
      if (kind === "approve") {
        const r = await approveSubmission(d.submission_id, notes.trim(), confirm);
        setMsg({ ok: true, text: `Approved as ${r.isolate_id}${r.created_septatype ? `. New septatype ${r.septatype_string} added.` : "."}` });
      } else {
        await rejectSubmission(d.submission_id, notes.trim());
        setMsg({ ok: true, text: "Submission rejected." });
      }
      setTimeout(onDone, 900);
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Action failed" });
      setBusy(null);
    }
  };

  const p = d?.prediction;
  return (
    <aside className="fixed inset-y-0 right-0 z-40 w-full max-w-xl overflow-y-auto border-l border-slate-200 bg-white p-5 shadow-2xl" aria-label="Submission detail">
      <div className="mb-4 flex items-start justify-between">
        <h2 className="text-lg font-semibold text-blue-950">Submission #{id}</h2>
        <button type="button" onClick={onClose} className="rounded px-2 py-1 text-slate-500 hover:bg-slate-100" aria-label="Close">✕</button>
      </div>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {loading && !d && <p className="text-sm text-slate-500">Loading…</p>}
      {d && (
        <div className="space-y-5 text-sm">
          <div className="flex flex-wrap gap-1.5">{d.flags.map((f) => <FlagBadge key={f.code} flag={f} long />)}</div>
          {d.analysis_state === "failed" && <p className="rounded bg-red-50 p-2 text-red-700">Analysis failed: {d.analysis_error}</p>}

          <dl className="grid grid-cols-[9rem_1fr] gap-x-3 gap-y-1">
            <dt className="text-slate-500">Isolate</dt><dd>{d.isolate_name ?? "—"}</dd>
            <dt className="text-slate-500">Declared species</dt><dd className="italic">{d.declared_species}</dd>
            <dt className="text-slate-500">Inferred species</dt><dd className="italic">{p?.species.inferred ?? "—"}</dd>
            <dt className="text-slate-500">Habitat / Country</dt><dd>{d.habitat} / {d.country}</dd>
            <dt className="text-slate-500">Year</dt><dd>{d.collection_year}</dd>
            <dt className="text-slate-500">Lab phenotype</dt>
            <dd>{d.experimental_phenotype && <LabBadge value={d.experimental_phenotype as LabPhenotype} />}</dd>
            <dt className="text-slate-500">MIC</dt>
            <dd>{d.experimental_mic != null ? `${d.experimental_mic} ${d.mic_unit ?? ""} ${d.mic_method ? `(${d.mic_method})` : ""}` : "—"}</dd>
            <dt className="text-slate-500">BV-BRC</dt>
            <dd>{d.bv_brc_id_supplied ? <>{d.bv_brc_id_supplied} {d.bv_brc_name_fetched ? <em className="text-slate-600">{d.bv_brc_name_fetched}</em> : <span className="text-amber-700">({d.bv_brc_lookup_status})</span>}</> : "Not provided"}</dd>
            <dt className="text-slate-500">Contact</dt><dd>{d.submitter_name ? `${d.submitter_name}, ` : ""}{d.contact_email}</dd>
            {d.source && (<><dt className="text-slate-500">Source</dt><dd>{d.source}</dd></>)}
          </dl>

          {p && (
            <>
              <div className="rounded-md bg-slate-50 p-3">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="font-mono text-base font-semibold">{p.septatype ?? "incomplete"}</span>
                  <span className={d.septatyper_prediction === "Cres" ? "font-semibold text-red-700" : "font-semibold text-emerald-700"}>
                    {d.septatyper_prediction}
                  </span>
                  <span className="text-slate-500">⟨H⟩ {p.mean_hydrophobicity ?? "n/a"}</span>
                </div>
                {p.tier1 && (
                  <p className="mt-1 text-xs text-slate-600">
                    Tier 1: {p.tier1.baseline} ({p.tier1.votes} resistance vote{p.tier1.votes === 1 ? "" : "s"}, decided by {p.tier1.decided_by.replace("_", " ")}).{" "}
                    {p.tier2?.override_applied ? `Tier 2 override: ${p.tier2.rules.map((r) => RULES[r] ?? r).join("; ")}.` : "No Tier 2 override."}
                  </p>
                )}
              </div>

              <table className="w-full border-collapse text-xs">
                <thead><tr className="border-b text-left text-slate-500"><th className="py-1">Position</th><th>Codon</th><th>Residue</th><th>Status</th></tr></thead>
                <tbody>
                  {ORDER.map((k) => p.codons[k] && (
                    <tr key={k} className="border-b border-slate-100">
                      <td className="py-1">{p.codons[k].position}</td>
                      <td className="font-mono">{p.codons[k].codon ?? "—"}</td>
                      <td className="font-mono">{p.codons[k].aa ?? "—"}</td>
                      <td className={p.codons[k].status === "ok" ? "text-slate-500" : "text-amber-700"}>{p.codons[k].status.replaceAll("_", " ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {p.recn346.synonymous_flag && <p className="text-xs text-violet-700">RecN-346 synonymous codon flagged: {p.recn346.codon}</p>}

              <table className="w-full border-collapse text-xs">
                <thead><tr className="border-b text-left text-slate-500"><th className="py-1">PMQR</th><th>Present</th><th>Identity</th><th>Coverage</th></tr></thead>
                <tbody>
                  {Object.entries(p.pmqr).map(([g, c]) => (
                    <tr key={g} className="border-b border-slate-100">
                      <td className="py-1">{g}</td><td>{c.present ? "Yes" : "No"}</td>
                      <td>{c.identity != null ? `${c.identity}%` : "—"}</td><td>{c.coverage != null ? `${c.coverage}%` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {p.warnings.length > 0 && (
                <ul className="list-disc space-y-0.5 pl-5 text-xs text-amber-800">{p.warnings.map((w) => <li key={w}>{w}</li>)}</ul>
              )}
            </>
          )}

          <div className="space-y-2 border-t border-slate-200 pt-4">
            <label className="block">
              <span className="text-slate-600">Curator notes</span>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={2000}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Required when rejecting" />
            </label>
            {reviewFlags.length > 0 && (
              <label className="flex items-start gap-2 text-amber-900">
                <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} className="mt-1" />
                <span>I have reviewed the flagged items ({reviewFlags.map((f) => f.label.toLowerCase()).join("; ")}) and still approve.</span>
              </label>
            )}
            {msg && <p role={msg.ok ? "status" : "alert"} className={msg.ok ? "text-emerald-700" : "text-red-700"}>{msg.text}</p>}
            <div className="flex gap-3">
              <button type="button" disabled={!canApprove || busy !== null} onClick={() => act("approve")}
                className="rounded-md bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-600 disabled:opacity-40">
                {busy === "approve" ? "Approving…" : "Approve"}
              </button>
              <button type="button" disabled={busy !== null} onClick={() => act("reject")}
                className="rounded-md border border-red-300 px-4 py-2 font-medium text-red-700 hover:bg-red-50 disabled:opacity-40">
                {busy === "reject" ? "Rejecting…" : "Reject"}
              </button>
            </div>
            {d.analysis_state !== "done" && <p className="text-xs text-slate-500">Approval needs a completed prediction. Failed analyses can only be rejected.</p>}
          </div>
        </div>
      )}
    </aside>
  );
}
