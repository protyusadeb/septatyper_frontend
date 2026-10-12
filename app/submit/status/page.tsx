"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SubmissionTracker from "@/components/submit/SubmissionTracker";

function Inner() {
  const params = useSearchParams();
  const id = Number(params.get("id"));
  const token = params.get("token") ?? "";
  if (!id || !token) return <p className="text-sm text-red-700">This link is incomplete. Use the full link you were given.</p>;
  return <SubmissionTracker id={id} token={token} />;
}

export default function StatusPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-8">
      <h1 className="text-2xl font-semibold text-blue-950">Submission status</h1>
      <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}><Inner /></Suspense>
    </main>
  );
}
