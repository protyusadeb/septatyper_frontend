"use client";
import { useRef, useState } from "react";
import { MAX_UPLOAD_MB } from "@/lib/submissions";

interface Props {
  file: File | null;
  onFile: (f: File | null) => void;
  disabled?: boolean;
}

const OK_EXT = /\.(fa|fas|fasta|fna|fa\.gz|fasta\.gz|fna\.gz|gz)$/i;
const size = (b: number) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.ceil(b / 1024)} KB`);

export default function FileDropzone({ file, onFile, disabled }: Props) {
  const [over, setOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const accept = (f: File | undefined) => {
    if (!f) return;
    if (!OK_EXT.test(f.name)) return setError("Use a FASTA file (.fasta, .fa, .fna), optionally gzipped.");
    if (f.size > MAX_UPLOAD_MB * 1048576) return setError(`File is larger than ${MAX_UPLOAD_MB} MB.`);
    if (f.size === 0) return setError("File is empty.");
    setError(null);
    onFile(f);
  };

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); if (!disabled) accept(e.dataTransfer.files[0]); }}
        className={`rounded-lg border-2 border-dashed p-6 text-center transition ${
          over ? "border-blue-600 bg-blue-50" : "border-slate-300 bg-white"
        } ${disabled ? "opacity-60" : ""}`}
      >
        {file ? (
          <div className="flex items-center justify-center gap-3 text-sm">
            <span className="font-medium text-slate-800">{file.name}</span>
            <span className="text-slate-500">{size(file.size)}</span>
            {!disabled && (
              <button type="button" onClick={() => onFile(null)} className="text-red-700 hover:underline">Remove</button>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-700">Drag and drop a genome assembly here, or</p>
            <button
              type="button"
              disabled={disabled}
              onClick={() => input.current?.click()}
              className="mt-2 rounded-md bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
            >
              Choose file
            </button>
            <p className="mt-2 text-xs text-slate-500">Nucleotide FASTA (.fasta, .fa, .fna), plain or .gz, up to {MAX_UPLOAD_MB} MB</p>
          </>
        )}
        <input
          ref={input}
          type="file"
          accept=".fa,.fas,.fasta,.fna,.gz"
          className="sr-only"
          aria-label="Genome FASTA file"
          onChange={(e) => { accept(e.target.files?.[0]); e.target.value = ""; }}
        />
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
