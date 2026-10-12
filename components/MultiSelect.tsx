"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FacetItem } from "@/lib/api";

interface Props {
  label: string;
  options: FacetItem[];
  selected: string[];
  onChange: (next: string[]) => void;
  searchable?: boolean;
}

export default function MultiSelect({ label, options, selected, onChange, searchable = false }: Props) {
  const [open, setOpen] = useState(false);
  const [needle, setNeedle] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const shown = useMemo(
    () => options.filter((o) => o.value.toLowerCase().includes(needle.toLowerCase())),
    [options, needle],
  );
  const toggle = (v: string) =>
    onChange(selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-left text-sm hover:border-blue-400"
        aria-expanded={open}
      >
        <span className="truncate">
          <span className="text-slate-500">{label}</span>
          {selected.length > 0 && (
            <span className="ml-2 rounded bg-blue-900 px-1.5 py-0.5 text-xs text-white">{selected.length}</span>
          )}
        </span>
        <span className="ml-2 text-slate-400">▾</span>
      </button>
      {open && (
        <div className="absolute z-30 mt-1 w-full min-w-[14rem] rounded-md border border-slate-200 bg-white shadow-lg">
          {searchable && (
            <input
              autoFocus
              value={needle}
              onChange={(e) => setNeedle(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}…`}
              className="w-full border-b border-slate-200 px-3 py-2 text-sm outline-none"
            />
          )}
          <ul className="max-h-60 overflow-y-auto py-1">
            {shown.length === 0 && <li className="px-3 py-2 text-sm text-slate-400">No matches</li>}
            {shown.map((o) => (
              <li key={o.value}>
                <label className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm hover:bg-slate-50">
                  <input type="checkbox" checked={selected.includes(o.value)} onChange={() => toggle(o.value)} />
                  <span className="flex-1 truncate">{o.value}</span>
                  <span className="text-xs text-slate-400">{o.count}</span>
                </label>
              </li>
            ))}
          </ul>
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="w-full border-t border-slate-200 px-3 py-2 text-left text-xs text-blue-800 hover:bg-slate-50"
            >
              Clear {label.toLowerCase()}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
