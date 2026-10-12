import { API_URL } from "./api";
import { authFetch, readError } from "./auth";

export const SPECIES = ["Escherichia coli", "Shigella sonnei", "Salmonella enterica subspecies I", "Klebsiella pneumoniae"] as const;
export const HABITATS = ["Fecal", "Urine", "Respiratory", "Other"] as const;
export const MAX_UPLOAD_MB = 60;

export interface Flag { code: string; label: string; severity: "review" | "info" }

export interface SubmissionAccepted { submission_id: number; status_token: string; analysis_state: string }

export interface SubmissionStatus {
  submission_id: number;
  status: string;
  analysis_state: string | null;
  analysis_error: string | null;
  bv_brc_id_supplied: string | null;
  bv_brc_lookup_status: string | null;
  bv_brc_name_fetched: string | null;
  septatype: string | null;
  septatyper_prediction: string | null;
  experimental_phenotype: string | null;
  flags: Flag[];
}

export interface QueueItem {
  submission_id: number;
  created_at: string | null;
  status: string;
  analysis_state: string | null;
  isolate_name: string | null;
  declared_species: string | null;
  habitat: string | null;
  country: string | null;
  collection_year: number | null;
  experimental_phenotype: string | null;
  septatyper_prediction: string | null;
  predicted_septatype_string: string | null;
  is_novel_septatype: boolean;
  prediction_matches_phenotype: boolean | null;
  bv_brc_id_supplied: string | null;
  bv_brc_name_fetched: string | null;
  flags: Flag[];
}

export interface QueuePage {
  total: number; page: number; page_size: number;
  counts: { needs_review: number; pending: number; failed: number };
  items: QueueItem[];
}

export interface CodonCall { position: string; codon: string | null; aa: string | null; status: string }
export interface PmqrCall { present: number; identity: number | null; coverage: number | null; contig: string | null }
export interface Prediction {
  species: { name: string | null; source: string; inferred: string | null };
  septatype: string | null;
  septatype_aa_level: string | null;
  mean_hydrophobicity: number | null;
  codons: Record<string, CodonCall>;
  recn346: { codon: string | null; aa: string | null; synonymous_flag: boolean | null };
  pmqr: Record<string, PmqrCall>;
  tier1: { baseline: string; votes: number; decided_by: string } | null;
  tier2: { override_applied: boolean; rules: string[] } | null;
  warnings: string[];
}

export interface SubmissionDetail extends QueueItem {
  contact_email: string | null; submitter_name: string | null; source: string | null;
  experimental_mic: number | null; mic_unit: string | null; mic_method: string | null;
  bv_brc_lookup_status: string | null; analysis_error: string | null;
  prediction: Prediction | null; curator_notes: string | null; decided_at: string | null;
}

export interface ApproveResult { isolate_id: string; septatype_id: number; septatype_string: string; created_septatype: boolean }

/** Multipart upload with progress (fetch cannot report upload progress). */
export function uploadSubmission(form: FormData, onProgress: (pct: number) => void): Promise<SubmissionAccepted> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_URL}/submissions`);
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100)); };
    xhr.onerror = () => reject(new Error("Network error. Check your connection and try again."));
    xhr.onload = () => {
      let body: unknown = null;
      try { body = JSON.parse(xhr.responseText); } catch { /* ignore */ }
      if (xhr.status === 202 && body) return resolve(body as SubmissionAccepted);
      const d = (body as { detail?: unknown } | null)?.detail;
      const msg = typeof d === "string" ? d
        : Array.isArray(d) ? d.map((x: { loc?: string[]; msg?: string }) => `${x.loc?.slice(-1)[0]}: ${x.msg}`).join("; ")
        : xhr.status === 429 ? "Too many submissions from your network. Please try again later."
        : `Upload failed (${xhr.status})`;
      reject(new Error(msg));
    };
    xhr.send(form);
  });
}

export async function fetchStatus(id: number, token: string, signal?: AbortSignal): Promise<SubmissionStatus> {
  const res = await fetch(`${API_URL}/submissions/${id}/status?token=${encodeURIComponent(token)}`, { signal });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export interface QueueQuery { status: "all" | "needs_review" | "pending"; novel: boolean; mismatch: boolean; page: number; pageSize: number }

export function fetchQueue(q: QueueQuery, signal?: AbortSignal) {
  const p = new URLSearchParams({ status: q.status, page: String(q.page), page_size: String(q.pageSize) });
  if (q.novel) p.set("novel", "true");
  if (q.mismatch) p.set("mismatch", "true");
  return authFetch<QueuePage>(`/submissions/pending?${p}`, {}, signal);
}
export const fetchDetail = (id: number, signal?: AbortSignal) => authFetch<SubmissionDetail>(`/submissions/${id}`, {}, signal);
export const approveSubmission = (id: number, notes: string, confirmFlags: boolean) =>
  authFetch<ApproveResult>(`/submissions/${id}/approve`, { method: "POST", body: JSON.stringify({ notes: notes || null, confirm_flags: confirmFlags }) });
export const rejectSubmission = (id: number, notes: string) =>
  authFetch<void>(`/submissions/${id}/reject`, { method: "POST", body: JSON.stringify({ notes }) });
