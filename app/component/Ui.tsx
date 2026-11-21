"use client";

import { useEffect, useState, type ReactNode } from "react";
import { apiFetch } from "@/lib/apiFetch";

/* ---------- Common class gulo (ekbar likhe shob jaygay use) ---------- */
export const inputClass =
  "w-full rounded-xl border border-[#D9D9D9] bg-white px-4 py-3 text-[#111111] outline-none transition-all duration-300 placeholder:text-[#6B6B6B]/60 focus:border-[#D9541E] focus:ring-4 focus:ring-[#D9541E]/15";
export const btnDark =
  "rounded-full bg-[#0B0B0B] px-4 py-2 text-xs text-white transition-all duration-300 hover:bg-[#D9541E] disabled:cursor-not-allowed disabled:opacity-40";
export const btnLight =
  "rounded-full border border-[#111111] px-4 py-2 text-xs text-[#111111] transition-all duration-300 hover:border-[#D9541E] hover:text-[#D9541E] disabled:cursor-not-allowed disabled:opacity-40";
export const trClass = "border-t border-[#D9D9D9]";
export const tdClass = "px-5 py-4 text-[#333333] align-middle";

/* ---------- Date format ---------- */
export function fmtDate(d?: string) {
  return d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
}

export function daysBetween(start: string, end: string) {
  return Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000));
}

/* ---------- API theke list ana (loading + error shoho) ---------- */
export function useApiList<T>(path: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<T[]>(path)
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [path]);

  return { data, setData, loading, error };
}

/* ---------- Page heading ---------- */
export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h1 className="text-3xl text-[#111111]">{title}</h1>
      <div className="mt-3 h-1 w-16 rounded-full bg-[#D9541E]" />
      {subtitle && <p className="mt-3 text-[#6B6B6B]">{subtitle}</p>}
    </div>
  );
}

/* ---------- Status badge (pending / paid / approved ...) ---------- */
export function StatusBadge({ value }: { value: string }) {
  const v = value.toLowerCase();
  const style = ["approved", "paid", "confirmed", "completed"].includes(v)
    ? "bg-[#111111] text-[#F3EEE3]"
    : ["rejected", "cancelled", "unpaid"].includes(v)
    ? "bg-[#D9541E]/15 text-[#D9541E]"
    : "bg-[#D9D9D9]/70 text-[#333333]";
  return <span className={`rounded-full px-3 py-1 text-xs capitalize ${style}`}>{value}</span>;
}

/* ---------- Table wrapper ---------- */
export function DataTable({
  headers,
  loading,
  error,
  empty,
  children,
}: {
  headers: string[];
  loading: boolean;
  error: string;
  empty: boolean;
  children: ReactNode;
}) {
  const cols = headers.length;
  return (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-[#D9D9D9] bg-white">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-[#F3EEE3] text-[#333333]">
          <tr>
            {headers.map((h) => (
              <th key={h} className="whitespace-nowrap px-5 py-4 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={cols} className="px-5 py-10 text-center text-[#6B6B6B]">
                Loading...
              </td>
            </tr>
          )}
          {!loading && error && (
            <tr>
              <td colSpan={cols} className="px-5 py-10 text-center text-[#D9541E]">
                {error}
              </td>
            </tr>
          )}
          {!loading && !error && empty && (
            <tr>
              <td colSpan={cols} className="px-5 py-10 text-center text-[#6B6B6B]">
                Nothing here yet.
              </td>
            </tr>
          )}
          {children}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Modal (popup) ---------- */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/50 p-4" onClick={onClose}>
      <div className="my-8 w-full max-w-2xl rounded-2xl bg-[#F3EEE3] p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl text-[#111111]">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="text-2xl leading-none text-[#6B6B6B] hover:text-[#D9541E]">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}