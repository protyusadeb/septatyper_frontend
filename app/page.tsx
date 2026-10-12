"use client";
import Link from "next/link";
import { API_URL, EMPTY_FILTERS, fetchSummary } from "@/lib/api";
import { useApi } from "@/lib/useApi";

const DOCS_URL = `${API_URL.replace(/\/api\/v1\/?$/, "")}/docs`;

export default function Home() {
  const { data, error } = useApi((s) => fetchSummary(EMPTY_FILTERS, s), "home-summary");
  const total = data ? data.total.toLocaleString() : error ? "n/a" : "…";

  return (
    <main className="mx-auto max-w-5xl space-y-10 px-4 py-12">
      <header className="space-y-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-800">Nucleic Acids Research database</p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-blue-950">
          Predict ciprofloxacin resistance from the sequence context of GyrA, ParC, RecN and qnr genes
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700">
          SeptaTyper reads the residues at GyrA-83, GyrA-87, ParC-80 and ParC-84 together, adds RecN-346 and the qnrB2 and
          qnrS1 gene families, and calls the phenotype with a context-dependent grammar.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/submit" className="rounded-md bg-blue-900 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">
            Upload Genome for Septatyping
          </Link>
          <Link href="/browse" className="rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Browse the repository
          </Link>
          <p className="text-sm text-slate-600" aria-live="polite">
            Currently hosting <strong className="text-2xl font-semibold text-blue-950">{total}</strong> genomes
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["/browse", "Browse and search", "Filter 2,734 isolates by species, habitat, sequence type, septatype, country and year, and compare SeptaTyper with BV-BRC predictions."],
          ["/theory", "The grammar", "The two-tier, context-dependent rules, an interactive structural explorer, and a performance summary."],
          ["/submit", "Contribute", "Submit a genome and its lab phenotype. Curators review every submission before it is published."],
        ].map(([href, title, text]) => (
          <Link key={href} href={href} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-400">
            <h2 className="text-base font-semibold text-blue-950">{title}</h2>
            <p className="mt-1 text-sm text-slate-600">{text}</p>
          </Link>
        ))}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-blue-950">Programmatic access</h2>
        <p className="mt-1 text-sm text-slate-600">
          The same data is available through a REST API with interactive documentation at{" "}
          <a className="text-blue-800 hover:underline" href={DOCS_URL} target="_blank" rel="noopener noreferrer">{DOCS_URL}</a>.
        </p>
        <pre className="mt-3 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">{`curl "${API_URL}/isolates?species=Shigella%20sonnei&septatyper_wins=true&page_size=5"`}</pre>
      </section>
    </main>
  );
}
