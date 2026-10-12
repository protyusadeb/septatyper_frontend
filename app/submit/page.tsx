import UploadGenomeForm from "@/components/submit/UploadGenomeForm";

export const metadata = { title: "Upload genome | SeptaTyper" };

export default function SubmitPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-5 px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold text-blue-950">Upload a genome for septatyping</h1>
        <p className="text-sm text-slate-600">
          We extract the five codons and the PMQR genes, predict the ciprofloxacin phenotype, and queue your isolate for curator review.
        </p>
      </header>
      <UploadGenomeForm />
    </main>
  );
}
