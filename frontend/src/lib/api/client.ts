import { env } from "@/config/environment";

/**
 * Thin API client. When NEXT_PUBLIC_API_URL is set, it calls the remote API;
 * otherwise it uses relative URL `/api/...` which hits Next.js Serverless API routes on Vercel.
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base = env.apiUrl ? env.apiUrl.replace(/\/$/, "") : "";
  const url = `${base}${path}`;

  const res = await fetch(url, {
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
