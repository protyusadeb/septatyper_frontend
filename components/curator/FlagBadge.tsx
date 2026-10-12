import type { Flag } from "@/lib/submissions";

const SHORT: Record<string, string> = {
  novel_septatype: "Novel septatype",
  phenotype_mismatch: "Phenotype mismatch",
  indeterminate_prediction: "No prediction",
  species_mismatch: "Species mismatch",
  bvbrc_id_not_found: "BV-BRC ID not found",
  bvbrc_lookup_failed: "BV-BRC lookup failed",
  duplicate_genome: "Duplicate genome",
  mic_phenotype_conflict: "MIC conflict",
  new_codon_variant: "New codon notation",
};

export default function FlagBadge({ flag, long = false }: { flag: Flag; long?: boolean }) {
  const review = flag.severity === "review";
  const tone = flag.code === "novel_septatype"
    ? "bg-violet-50 text-violet-800 ring-violet-200"
    : flag.code === "phenotype_mismatch"
      ? "bg-red-50 text-red-700 ring-red-200"
      : review ? "bg-amber-50 text-amber-800 ring-amber-200" : "bg-slate-50 text-slate-600 ring-slate-200";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tone}`} title={flag.label}>
      {long ? flag.label : SHORT[flag.code] ?? flag.code}
    </span>
  );
}
