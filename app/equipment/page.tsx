"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, MapPin, Search } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import type { Equipment } from "@/lib/types";

const API = process.env.NEXT_PUBLIC_API_URL;

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect width='100%25' height='100%25' fill='%23F3EEE3'/%3E%3Ccircle cx='400' cy='260' r='72' fill='%23D9541E' opacity='0.18'/%3E%3Ctext x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' fill='%23111111' font-family='sans-serif' font-size='34'%3EGearly%3C/text%3E%3C/svg%3E";

function isEquipment(value: unknown): value is Equipment {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Equipment>;
  return typeof item._id === "string" && typeof item.name === "string";
}

function priceLabel(item: Equipment): string {
  const amount = Number(item.rentalPrice);
  const value = Number.isFinite(amount)
    ? amount.toLocaleString("en-US", { maximumFractionDigits: 0 })
    : "—";
  const type = item.rentalType ? String(item.rentalType).toLowerCase() : "day";
  return `$${value} / ${type}`;
}

export default function EquipmentPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [items, setItems] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadEquipment() {
      setLoading(true);
      setError(null);

      try {
        // Limit na dilo backend sob approved item return kore.
        const response = await fetch(`${API}/api/equipment`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Could not load equipment");

        const payload: unknown = await response.json();
        if (!Array.isArray(payload)) throw new Error("Invalid equipment response");

        setItems(payload.filter(isEquipment));
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === "AbortError") return;
        setError(
          loadError instanceof Error ? loadError.message : "Could not load equipment"
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadEquipment();
    return () => controller.abort();
  }, [reloadKey]);

  const openDetails = (id: string) => {
    if (isPending) return;
    router.push(session?.user ? `/equipment/${id}` : "/login");
  };

  const normalizedQuery = query.trim().toLowerCase();
  const visibleItems = normalizedQuery
    ? items.filter((item) =>
        [item.name, item.category, item.location, item.brand, item.model]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedQuery))
      )
    : items;

  return (
    <main className="min-h-screen bg-[#F3EEE3] text-[#111111]">
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8 lg:py-20">
        <span className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.18em] text-[#D9541E]">
          <span className="h-px w-8 bg-[#D9541E]" />
          Browse collection
        </span>
        <h1 className="mt-4 text-3xl font-light leading-tight sm:text-4xl lg:text-5xl">
          All equipment available for rent
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#111111]/60">
          Explore every approved listing from trusted owners and find the right gear for your next project.
        </p>

        <div className="mt-8 flex max-w-md items-center gap-3 rounded-full border border-[#111111]/10 bg-white px-5 py-3 shadow-sm">
          <Search className="h-4 w-4 shrink-0 text-[#D9541E]" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, category, or location"
            aria-label="Search equipment"
            className="w-full bg-transparent text-sm text-[#111111] outline-none placeholder:text-[#111111]/40"
          />
        </div>

        {!loading && !error && (
          <p className="mt-5 text-sm text-[#111111]/50">
            {visibleItems.length} {visibleItems.length === 1 ? "item" : "items"} found
          </p>
        )}

        <div className="mt-8">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="overflow-hidden rounded-3xl border border-[#111111]/10 bg-white">
                  <div className="aspect-[4/3] animate-pulse bg-[#111111]/5" />
                  <div className="space-y-3 p-5">
                    <div className="h-3 w-1/3 animate-pulse rounded bg-[#111111]/10" />
                    <div className="h-5 w-3/4 animate-pulse rounded bg-[#111111]/10" />
                    <div className="h-11 w-full animate-pulse rounded-full bg-[#111111]/10" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-[#111111]/10 bg-white p-10 text-center">
              <p className="text-[#111111]">{error}</p>
              <button
                type="button"
                onClick={() => setReloadKey((key) => key + 1)}
                className="mt-5 rounded-full bg-[#D9541E] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#111111]"
              >
                Try again
              </button>
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#111111]/20 bg-white p-10 text-center text-[#111111]/60">
              {items.length === 0
                ? "No approved equipment is available right now."
                : "No equipment matches your search."}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibleItems.map((item) => (
                <article
                  key={item._id}
                  className="flex h-full flex-col overflow-hidden rounded-3xl border border-[#111111]/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#111111]/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={String(item.image || FALLBACK_IMAGE)}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      onError={(event) => {
                        event.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-medium uppercase tracking-wide text-[#D9541E]">
                        {item.category || "Equipment"}
                      </span>
                      <span className="text-sm font-medium text-[#111111]">{priceLabel(item)}</span>
                    </div>
                    <h2 className="mt-3 text-lg font-medium text-[#111111]">{item.name}</h2>
                    <p className="mt-2 flex items-center gap-2 text-sm text-[#111111]/55">
                      <MapPin className="h-4 w-4 text-[#D9541E]" />
                      {item.location || "Location not provided"}
                    </p>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => openDetails(item._id)}
                      className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#111111] px-5 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-[#D9541E] disabled:cursor-wait disabled:opacity-60"
                    >
                      View Details
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#111111]/60 transition-colors hover:text-[#D9541E]"
          >
            Back to home
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
