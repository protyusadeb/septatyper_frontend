import type { BvbrcPrediction, IsolateRow, LabPhenotype, SeptaPrediction } from "@/lib/api";

const base = "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap";

function Mark({ ok }: { ok: boolean | null }) {
  if (ok === null) return null;
  return ok ? (
    <span className="text-emerald-600" title="Matches lab phenotype" aria-label="matches lab phenotype">✓</span>
  ) : (
    <span className="text-red-600" title="Does not match lab phenotype" aria-label="does not match lab phenotype">✗</span>
  );
}

export function LabBadge({ value }: { value: LabPhenotype }) {
  const res = value === "Resistant";
  return (
    <span className={`${base} ${res ? "bg-red-50 text-red-700 ring-red-200" : "bg-emerald-50 text-emerald-700 ring-emerald-200"}`}>
      {res ? "Resistant" : "Susceptible"}
    </span>
  );
}

export function BvbrcBadge({ value, correct }: { value: BvbrcPrediction | null; correct: boolean | null }) {
  if (value === null) return <span className={`${base} bg-slate-50 text-slate-400 ring-slate-200`}>Not fetched</span>;
  if (value === "No_call") return <span className={`${base} bg-slate-100 text-slate-600 ring-slate-300`}>No call</span>;
  const res = value === "Resistant";
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`${base} ${res ? "bg-red-50 text-red-700 ring-red-200" : "bg-emerald-50 text-emerald-700 ring-emerald-200"}`}>
        {value}
      </span>
      <Mark ok={correct} />
    </span>
  );
}

export function GoldStar({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${className} shrink-0 drop-shadow-sm`}
      role="img"
      aria-label="SeptaTyper correct, BV-BRC wrong or no call"
    >
      <title>SeptaTyper predicted the lab phenotype correctly; BV-BRC failed or made no call</title>
      <path
        d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8L12 2.5z"
        fill="#F5B301"
        stroke="#B7860B"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SeptaBadge({ row }: { row: IsolateRow }) {
  const pred: SeptaPrediction | null = row.septatyper_prediction;
  if (pred === null) return <span className={`${base} bg-slate-50 text-slate-400 ring-slate-200`}>Pending</span>;
  const res = pred === "Cres";
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`${base} ${res ? "bg-red-50 text-red-700 ring-red-200" : "bg-emerald-50 text-emerald-700 ring-emerald-200"}`}>
        {pred}
      </span>
      <Mark ok={row.septatyper_correct} />
      {row.septatyper_wins === true && <GoldStar />}
    </span>
  );
}

/** Column 1: BV-BRC Genome ID as a hyperlink, official genome name nested below it. */
export function GenomeCell({ row }: { row: IsolateRow }) {
  return (
    <div className="min-w-[14rem] max-w-[22rem]">
      {row.bv_brc_url ? (
        <a
          href={row.bv_brc_url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-sm font-semibold text-blue-800 hover:underline"
        >
          {row.bv_brc_genome_id}
        </a>
      ) : (
        <span className="font-mono text-sm font-semibold text-slate-700" title="Community submission without a BV-BRC ID">
          {row.bv_brc_genome_id}
        </span>
      )}
      <div className="truncate text-xs leading-tight text-slate-500" title={row.official_genome_name ?? row.isolate_name ?? ""}>
        {row.official_genome_name ?? <span className="italic text-slate-400">name not yet fetched</span>}
      </div>
    </div>
  );
}
