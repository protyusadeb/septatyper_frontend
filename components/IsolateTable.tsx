"use client";
import { useEffect, useMemo, useState } from "react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Filters, IsolateRow, fetchIsolates } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { BvbrcBadge, GenomeCell, LabBadge, SeptaBadge } from "./benchmark";

/** TanStack column id -> `sort_by` value accepted by GET /isolates. */
const SORT_KEY: Record<string, string> = {
  genome: "bv_brc_genome_id",
  species: "species",
  habitat: "habitat",
  st: "mlst_st",
  septatype: "septatype",
  year: "collection_year",
  country: "country",
  lab: "lab_phenotype",
  bvbrc: "bv_brc_prediction",
  septatyper: "septatyper_prediction",
};

const columns: ColumnDef<IsolateRow>[] = [
  {
    id: "genome",
    header: "Genome ID / Name",
    cell: ({ row }) => <GenomeCell row={row.original} />,
  },
  {
    id: "species",
    header: "Species",
    cell: ({ row }) => <span className="italic">{row.original.species}</span>,
  },
  { id: "habitat", header: "Habitat", cell: ({ row }) => row.original.habitat ?? "—" },
  { id: "st", header: "ST", cell: ({ row }) => row.original.mlst_st ?? "—" },
  {
    id: "septatype",
    header: "Septatype",
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.septatype ?? "—"}</span>,
  },
  { id: "year", header: "Year", cell: ({ row }) => row.original.collection_year_raw ?? "—" },
  { id: "country", header: "Country", cell: ({ row }) => row.original.country_name ?? "—" },
  { id: "lab", header: "Lab phenotype", cell: ({ row }) => <LabBadge value={row.original.lab_phenotype} /> },
  {
    id: "bvbrc",
    header: "BV-BRC computational",
    cell: ({ row }) => (
      <BvbrcBadge value={row.original.bv_brc_computational_prediction} correct={row.original.bvbrc_correct} />
    ),
  },
  { id: "septatyper", header: "SeptaTyper", cell: ({ row }) => <SeptaBadge row={row.original} /> },
];

export default function IsolateTable({ filters }: { filters: Filters }) {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [sorting, setSorting] = useState<SortingState>([{ id: "genome", desc: false }]);

  const filterKey = JSON.stringify(filters);
  useEffect(() => setPageIndex(0), [filterKey, pageSize, sorting]);

  const sort = sorting[0];
  const sortBy = sort ? SORT_KEY[sort.id] : "bv_brc_genome_id";
  const sortDir = sort?.desc ? "desc" : "asc";

  const { data, loading, error } = useApi(
    (signal) => fetchIsolates({ filters, page: pageIndex + 1, pageSize, sortBy, sortDir }, signal),
    JSON.stringify([filters, pageIndex, pageSize, sortBy, sortDir]),
  );

  const rows = useMemo(() => data?.items ?? [], [data]);
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, pagination: { pageIndex, pageSize } },
    pageCount,
    manualPagination: true,
    manualSorting: true,
    enableMultiSort: false,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (r) => r.bv_brc_genome_id,
  });

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm" aria-label="Isolate table">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 text-sm text-slate-600">
        <span>
          {loading && !data ? "Loading…" : <><strong className="text-slate-900">{total.toLocaleString()}</strong> isolates match</>}
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-500">
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
            <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8L12 2.5z" fill="#F5B301" stroke="#B7860B" />
          </svg>
          SeptaTyper correct where BV-BRC failed or made no call
        </span>
      </div>

      {error && (
        <div role="alert" className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load isolates. {error}
        </div>
      )}

      <div className={`overflow-x-auto ${loading ? "opacity-60" : ""}`}>
        <table className="w-full border-collapse text-sm">
          <thead className="bg-blue-950 text-left text-xs uppercase tracking-wide text-blue-50">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => {
                  const dir = h.column.getIsSorted();
                  return (
                    <th key={h.id} className="px-3 py-2.5 font-semibold" aria-sort={dir === "asc" ? "ascending" : dir === "desc" ? "descending" : "none"}>
                      <button type="button" onClick={h.column.getToggleSortingHandler()} className="flex items-center gap-1 whitespace-nowrap uppercase">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        <span className="text-blue-300">{dir === "asc" ? "▲" : dir === "desc" ? "▼" : ""}</span>
                      </button>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => {
              const win = row.original.septatyper_wins === true;
              return (
                <tr
                  key={row.id}
                  className={`border-b border-slate-100 align-top hover:bg-blue-50/40 ${
                    win ? "bg-amber-50/70 shadow-[inset_3px_0_0_#F5B301]" : ""
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
            {!loading && !error && rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-3 py-10 text-center text-slate-500">
                  No isolates match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm">
        <label className="flex items-center gap-2 text-slate-600">
          Rows per page
          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="rounded border border-slate-300 px-2 py-1">
            {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setPageIndex(0)} disabled={pageIndex === 0} className="rounded border border-slate-300 px-2 py-1 disabled:opacity-40">«</button>
          <button type="button" onClick={() => setPageIndex((p) => Math.max(0, p - 1))} disabled={pageIndex === 0} className="rounded border border-slate-300 px-3 py-1 disabled:opacity-40">Prev</button>
          <span className="px-2 text-slate-600">Page {pageIndex + 1} of {pageCount.toLocaleString()}</span>
          <button type="button" onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))} disabled={pageIndex >= pageCount - 1} className="rounded border border-slate-300 px-3 py-1 disabled:opacity-40">Next</button>
          <button type="button" onClick={() => setPageIndex(pageCount - 1)} disabled={pageIndex >= pageCount - 1} className="rounded border border-slate-300 px-2 py-1 disabled:opacity-40">»</button>
        </div>
      </div>
    </section>
  );
}
