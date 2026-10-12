"use client";
import { useSyncExternalStore } from "react";
import { API_URL } from "./api";

const KEY = "septatyper_token";
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

// Held in sessionStorage: it disappears when the tab closes. A token in JS-readable storage is
// exposed to XSS, so keep the app free of untrusted HTML. Use an httpOnly cookie if you later
// serve the API and site from one domain.
export const getToken = (): string | null => (typeof window === "undefined" ? null : sessionStorage.getItem(KEY));
export function setToken(token: string) { sessionStorage.setItem(KEY, token); emit(); }
export function clearToken() { sessionStorage.removeItem(KEY); emit(); }
const subscribe = (cb: () => void) => { listeners.add(cb); return () => { listeners.delete(cb); }; };
export const useToken = () => useSyncExternalStore(subscribe, getToken, () => null);

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function readError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    const d = body?.detail;
    if (typeof d === "string") return d;
    if (Array.isArray(d)) return d.map((x: { loc?: string[]; msg?: string }) => `${x.loc?.slice(-1)[0] ?? "field"}: ${x.msg}`).join("; ");
  } catch { /* not JSON */ }
  return `Request failed (${res.status})`;
}

export async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new ApiError(res.status, await readError(res));
  const data = (await res.json()) as { access_token: string; role: string };
  if (data.role !== "curator" && data.role !== "admin") throw new ApiError(403, "This account does not have curator access");
  setToken(data.access_token);
  return data.role;
}

export async function authFetch<T>(path: string, init: RequestInit = {}, signal?: AbortSignal): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const res = await fetch(`${API_URL}${path}`, { ...init, headers, signal });
  if (res.status === 401) { clearToken(); throw new ApiError(401, "Your session expired. Please sign in again."); }
  if (!res.ok) throw new ApiError(res.status, await readError(res));
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}
