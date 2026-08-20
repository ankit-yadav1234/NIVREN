import { env } from "@/config/environment";

/**
 * Thin API client. When NEXT_PUBLIC_API_URL is set, services can call
 * `apiFetch`; otherwise they return local static data. This keeps UI
 * components decoupled from the data source.
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!env.useRemoteApi) {
    throw new Error("Remote API not configured (NEXT_PUBLIC_API_URL is empty).");
  }
  const res = await fetch(`${env.apiUrl}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/** Simulate async access so swapping to a real API changes nothing upstream. */
export function local<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}
