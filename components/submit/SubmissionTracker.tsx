"use client";
import { useEffect, useState } from "react";
import { SubmissionStatus, fetchStatus } from "@/lib/submissions";
import FlagBadge from "../curator/FlagBadge";

export default function SubmissionTracker({ id, token }: { id: number; token: string }) {
  const [status, setStatus] = useState<SubmissionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stop = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const tick = async () => {
      try {
        const s = await fetchStatus(id, token);
        if (stop) return;
        setStatus(s);
        setError(null);
        if (s.analysis_state === "queued" || s.analysis_state === "running") timer = setTimeout(tick, 3000);
      } catch (e) {
        if (!stop) setError(e instanceof Error ? e.message : "Could not load status");
      }
    };
    void tick();
    return () => { stop = true; if (timer) clearTimeout(timer); };
  }, [id, token]);

  if (error) return <p role="alert" className="text-sm text-red-700">{error}</p>;
  if (!status) return <p className="text-sm text-slate-500">Checking status…</p>;

  const working = status.analysis_state === "queued" || status.analysis_state === "running";
  const failed = status.analysis_state === "failed";
  const review = status.flags.filter((f) => f.severity === "review");

  return (
    <div className="space-y-3 text-sm" aria-live="polite">
      <div className="flex items-center gap-2">
        {working && <span className="h-3 w-3 animate-pulse rounded-full bg-blue-600" />}
        <strong className="text-slate-900">
          {working ? "Analysing your genome…" : failed ? "Analysis failed" : status.status === "approved" ? "Approved and published"
            : status.status === "rejected" ? "Not accepted" : "Received. Waiting for curator review"}
        </strong>
      </div>
      {failed && <p className="text-red-700">{status.analysis_error}</p>}
      {status.bv_brc_id_supplied && !working && (
        <p className="text-slate-600">
          BV-BRC genome {status.bv_brc_id_supplied}:{" "}
          {status.bv_brc_lookup_status === "ok" ? <em>{status.bv_brc_name_fetched}</em>
            : status.bv_brc_lookup_status === "not_found" ? "not found, a curator will check the ID"
            : "lookup unavailable, a curator will check the ID"}
        </p>
      )}
      {status.septatype && (
        <dl className="grid max-w-md grid-cols-2 gap-x-4 gap-y-1 rounded-md bg-slate-50 p-3">
          <dt className="text-slate-500">Septatype</dt><dd className="font-mono">{status.septatype}</dd>
          <dt className="text-slate-500">SeptaTyper prediction</dt><dd>{status.septatyper_prediction}</dd>
          <dt className="text-slate-500">Your phenotype</dt><dd>{status.experimental_phenotype}</dd>
        </dl>
      )}
      {review.length > 0 && (
        <div>
          <p className="mb-1 text-slate-600">A curator will look at these points before publishing:</p>
          <div className="flex flex-wrap gap-1.5">{review.map((f) => <FlagBadge key={f.code} flag={f} long />)}</div>
        </div>
      )}
    </div>
  );
}
