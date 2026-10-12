export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export type LabPhenotype = "Resistant" | "Susceptible";
export type BvbrcPrediction = "Resistant" | "Susceptible" | "No_call";
export type SeptaPrediction = "Cres" | "Csus";

export interface IsolateRow {
  bv_brc_genome_id: string;
  bv_brc_url: string | null; // null for community isolates without a BV-BRC ID
  official_genome_name: string | null;
  isolate_name: string | null;
  species: string;
  habitat: string | null;
  mlst_st: string | null;
  septatype: string | null;
  collection_year_raw: string | null;
  collection_year_start: number | null;
  collection_year_end: number | null;
  country_name: string | null;
  country_iso3: string | null;
  lab_phenotype: LabPhenotype;
  bv_brc_computational_prediction: BvbrcPrediction | null;
  septatyper_prediction: SeptaPrediction | null;
  septatyper_correct: boolean | null;
  bvbrc_correct: boolean | null;
  septatyper_wins: boolean | null;
}

export interface IsolatePage {
  total: number;
  page: number;
  page_size: number;
  items: IsolateRow[];
}

export interface FacetItem {
  value: string;
  count: number;
}

export interface Facets {
  species: FacetItem[];
  habitat: FacetItem[];
  st: FacetItem[];
  septatype: FacetItem[];
  country: FacetItem[];
  year_min: number | null;
  year_max: number | null;
}

export interface Summary {
  total: number;
  lab_resistant: number;
  lab_susceptible: number;
  septatyper_predicted: number;
  septatyper_accuracy: number | null;
  bvbrc_predicted: number;
  bvbrc_accuracy: number | null;
  bvbrc_no_call: number;
  septatyper_wins: number;
}

export interface CountryStat {
  iso3: string;
  country: string | null;
  n_isolates: number;
  n_resistant: number;
  resistant_fraction: number;
}

export interface HabitatSeptatypeStat {
  habitat: string;
  septatype: string;
  n: number;
}

/** Filter state shared by the table and the charts. */
export interface Filters {
  q: string;
  species: string[];
  habitat: string[];
  st: string[];
  septatype: string[];
  country: string[];
  yearMin: string;
  yearMax: string;
  labPhenotype: "" | LabPhenotype;
  bvbrcPrediction: "" | BvbrcPrediction;
  septatyperPrediction: "" | SeptaPrediction;
  septatyperWins: boolean;
  bvbrcFailed: boolean;
  septatyperCorrect: boolean;
}

export const EMPTY_FILTERS: Filters = {
  q: "",
  species: [],
  habitat: [],
  st: [],
  septatype: [],
  country: [],
  yearMin: "",
  yearMax: "",
  labPhenotype: "",
  bvbrcPrediction: "",
  septatyperPrediction: "",
  septatyperWins: false,
  bvbrcFailed: false,
  septatyperCorrect: false,
};

export function filtersToParams(f: Filters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.q.trim()) p.set("q", f.q.trim());
  f.species.forEach((v) => p.append("species", v));
  f.habitat.forEach((v) => p.append("habitat", v));
  f.st.forEach((v) => p.append("st", v));
  f.septatype.forEach((v) => p.append("septatype", v));
  f.country.forEach((v) => p.append("country", v));
  if (f.yearMin) p.set("year_min", f.yearMin);
  if (f.yearMax) p.set("year_max", f.yearMax);
  if (f.labPhenotype) p.set("lab_phenotype", f.labPhenotype);
  if (f.bvbrcPrediction) p.set("bvbrc_prediction", f.bvbrcPrediction);
  if (f.septatyperPrediction) p.set("septatyper_prediction", f.septatyperPrediction);
  if (f.septatyperWins) p.set("septatyper_wins", "true");
  if (f.bvbrcFailed) p.set("bvbrc_correct", "false");
  if (f.septatyperCorrect) p.set("septatyper_correct", "true");
  return p;
}

async function getJson<T>(path: string, params?: URLSearchParams, signal?: AbortSignal): Promise<T> {
  const qs = params && params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${API_URL}${path}${qs}`, { signal });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export interface IsolateQuery {
  filters: Filters;
  page: number; // 1-based
  pageSize: number;
  sortBy: string;
  sortDir: "asc" | "desc";
}

export const fetchIsolates = (q: IsolateQuery, signal?: AbortSignal) => {
  const p = filtersToParams(q.filters);
  p.set("page", String(q.page));
  p.set("page_size", String(q.pageSize));
  p.set("sort_by", q.sortBy);
  p.set("sort_dir", q.sortDir);
  return getJson<IsolatePage>("/isolates", p, signal);
};

export const fetchFacets = (signal?: AbortSignal) => getJson<Facets>("/filters", undefined, signal);

export const fetchSummary = (f: Filters, signal?: AbortSignal) =>
  getJson<Summary>("/stats/summary", filtersToParams(f), signal);

export const fetchCountryStats = (f: Filters, signal?: AbortSignal) =>
  getJson<CountryStat[]>("/stats/countries", filtersToParams(f), signal);

export const fetchHabitatSeptatype = (f: Filters, top = 8, signal?: AbortSignal) => {
  const p = filtersToParams(f);
  p.set("top", String(top));
  return getJson<HabitatSeptatypeStat[]>("/stats/septatype-habitat", p, signal);
};
