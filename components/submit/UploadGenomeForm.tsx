"use client";
import { FormEvent, useState } from "react";
import { Facets, fetchFacets } from "@/lib/api";
import { HABITATS, SPECIES, SubmissionAccepted, uploadSubmission } from "@/lib/submissions";
import { useApi } from "@/lib/useApi";
import FileDropzone from "./FileDropzone";
import SubmissionTracker from "./SubmissionTracker";

const input = "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500";
const label = "block text-sm";
const hint = "text-xs text-slate-500";
const thisYear = new Date().getFullYear();

function Field({ name, children, help }: { name: string; children: React.ReactNode; help?: string }) {
  return (
    <label className={label}>
      <span className="font-medium text-slate-700">{name}</span>
      {children}
      {help && <span className={hint}>{help}</span>}
    </label>
  );
}

export default function UploadGenomeForm() {
  const [file, setFile] = useState<File | null>(null);
  const [v, setV] = useState({
    contact_email: "", submitter_name: "", species: "", habitat: "", country: "", collection_year: "",
    lab_phenotype: "", mic_value: "", mic_unit: "mg/L", mic_method: "", bv_brc_id: "", isolate_name: "", source: "",
  });
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState<SubmissionAccepted | null>(null);
  const facets = useApi<Facets>((s) => fetchFacets(s), "facets");
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV({ ...v, [k]: e.target.value });
  const busy = progress !== null;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!file) return setError("Choose a genome FASTA file first.");
    if (!v.lab_phenotype) return setError("Select the laboratory ciprofloxacin phenotype.");
    const fd = new FormData();
    fd.append("file", file);
    Object.entries(v).forEach(([k, val]) => {
      if (k === "mic_unit" && !v.mic_value.trim()) return;
      if (String(val).trim()) fd.append(k, String(val).trim());
    });
    setProgress(0);
    try {
      setAccepted(await uploadSubmission(fd, setProgress));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setProgress(null);
    }
  };

  if (accepted) {
    const link = `/submit/status?id=${accepted.submission_id}&token=${encodeURIComponent(accepted.status_token)}`;
    return (
      <section className="space-y-4 rounded-lg border border-emerald-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-blue-950">Thank you. Submission #{accepted.submission_id} received</h2>
        <p className="text-sm text-slate-600">
          Your genome is staged for review and is not public yet. Bookmark this link to check progress later, because it
          is the only way to look the submission up:
        </p>
        <code className="block break-all rounded bg-slate-100 p-2 text-xs">{link}</code>
        <SubmissionTracker id={accepted.submission_id} token={accepted.status_token} />
      </section>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-blue-950">1. Genome assembly</h2>
        <FileDropzone file={file} onFile={setFile} disabled={busy} />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-blue-950">2. Isolate details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="Species *">
            <select required className={input} value={v.species} onChange={set("species")}>
              <option value="">Select species</option>
              {SPECIES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field name="Habitat *">
            <select required className={input} value={v.habitat} onChange={set("habitat")}>
              <option value="">Select habitat</option>
              {HABITATS.map((h) => <option key={h}>{h}</option>)}
            </select>
          </Field>
          <Field name="Country *" help="Full name or 3-letter ISO code">
            <input required list="countries" className={input} value={v.country} onChange={set("country")} placeholder="e.g. Bangladesh" />
            <datalist id="countries">{(facets.data?.country ?? []).map((c) => <option key={c.value} value={c.value} />)}</datalist>
          </Field>
          <Field name="Collection year *">
            <input required type="number" min={1900} max={thisYear} className={input} value={v.collection_year} onChange={set("collection_year")} />
          </Field>
          <Field name="Isolate name" help="Your own label for this isolate">
            <input maxLength={200} className={input} value={v.isolate_name} onChange={set("isolate_name")} />
          </Field>
          <Field name="BV-BRC Genome ID" help="Optional, e.g. 562.7710. We fetch the official genome name.">
            <input pattern="\d+\.\d+" className={input} value={v.bv_brc_id} onChange={set("bv_brc_id")} placeholder="562.7710" />
          </Field>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-blue-950">3. Laboratory ciprofloxacin result</h2>
        <fieldset>
          <legend className="text-sm font-medium text-slate-700">Phenotype *</legend>
          <div className="mt-1 flex gap-4">
            {["Resistant", "Susceptible"].map((p) => (
              <label key={p} className="flex items-center gap-2 text-sm">
                <input type="radio" name="phenotype" value={p} checked={v.lab_phenotype === p} onChange={set("lab_phenotype")} />
                <span className={p === "Resistant" ? "text-red-700" : "text-emerald-700"}>{p}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field name="MIC (optional)">
            <input type="number" step="any" min="0" className={input} value={v.mic_value} onChange={set("mic_value")} placeholder="e.g. 0.06" />
          </Field>
          <Field name="Unit">
            <select className={input} value={v.mic_unit} onChange={set("mic_unit")}>
              <option value="mg/L">mg/L</option><option value="ug/mL">µg/mL</option>
            </select>
          </Field>
          <Field name="MIC method">
            <input maxLength={60} className={input} value={v.mic_method} onChange={set("mic_method")} placeholder="Broth microdilution, Etest…" />
          </Field>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-blue-950">4. Contact</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="Email *" help="Used only to contact you about this submission">
            <input required type="email" autoComplete="email" className={input} value={v.contact_email} onChange={set("contact_email")} />
          </Field>
          <Field name="Name">
            <input autoComplete="name" maxLength={120} className={input} value={v.submitter_name} onChange={set("submitter_name")} />
          </Field>
        </div>
        <Field name="Source or notes">
          <input maxLength={80} className={input} value={v.source} onChange={set("source")} placeholder="e.g. hospital surveillance, 2019" />
        </Field>
      </section>

      {busy && (
        <div aria-live="polite">
          <div className="h-2 overflow-hidden rounded bg-slate-200"><div className="h-full bg-blue-700 transition-all" style={{ width: `${progress}%` }} /></div>
          <p className="mt-1 text-xs text-slate-500">{progress === 100 ? "Processing upload…" : `Uploading ${progress}%`}</p>
        </div>
      )}
      {error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={busy} className="rounded-md bg-blue-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50">
        {busy ? "Uploading…" : "Submit genome"}
      </button>
      <p className={hint}>Submissions are reviewed by curators before they appear in the database.</p>
    </form>
  );
}
