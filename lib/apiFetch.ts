import { authClient } from "@/lib/auth-client";

const API = process.env.NEXT_PUBLIC_API_URL; // jemon http://localhost:5000

// Express backend e call dewar jonno. Better Auth er JWT token automatic header e jay.
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  // Better Auth JWT plugin theke token ana
  const { data } = await authClient.token();

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: `Bearer ${data?.token ?? ""}`,
    },
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || "Request failed");
  return body as T;
}