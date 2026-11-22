"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  CalendarDays,
  Heart,
  MapPin,
  Package,
  ShieldCheck,
  Tag,
  UserRound,
  Wrench,
} from "lucide-react";
import { apiFetch } from "@/lib/apiFetch";
import { authClient } from "@/lib/auth-client";
import type { Equipment } from "@/lib/types";
import {
  Modal,
  PageHeader,
  StatusBadge,
  btnDark,
  btnLight,
  inputClass,
} from "@/app/component/Ui";

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect width='100%25' height='100%25' fill='%23F3EEE3'/%3E%3Ccircle cx='400' cy='260' r='72' fill='%23D9541E' opacity='0.18'/%3E%3Ctext x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' fill='%23111111' font-family='sans-serif' font-size='34'%3EGearly%3C/text%3E%3C/svg%3E";

type Role = "customer" | "owner" | "admin";

type BookingForm = {
  startDate: string;
  endDate: string;
  quantity: string;
  phone: string;
  deliveryAddress: string;
  notes: string;
};

const emptyBooking: BookingForm = {
  startDate: "",
  endDate: "",
  quantity: "1",
  phone: "",
  deliveryAddress: "",
  notes: "",
};

function rentalUnits(start: string, end: string, rentalType?: string) {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  const days = Math.max(1, Math.ceil(diff / 86400000));
  const type = String(rentalType || "Daily").toLowerCase();
  const units =
    type === "weekly"
      ? Math.max(1, Math.ceil(days / 7))
      : type === "monthly"
      ? Math.max(1, Math.ceil(days / 30))
      : days;
  return { days, units };
}

function money(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? amount.toLocaleString("en-US", { maximumFractionDigits: 2 })
    : "—";
}

function Field({ label, value }: { label: string; value?: unknown }) {
  if (value === undefined || value === null || String(value).trim() === "") return null;
  return (
    <div className="border-t border-[#D9D9D9] py-3">
      <dt className="text-xs uppercase tracking-wide text-[#6B6B6B]">{label}</dt>
      <dd className="mt-1 text-sm text-[#111111]">{String(value)}</dd>
    </div>
  );
}

export default function EquipmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : String(rawId || "");

  const { data: session, isPending } = authClient.useSession();
  const authenticated = !!session?.user;
  const role = String(
    (session?.user as { role?: string } | undefined)?.role || "customer"
  ).toLowerCase() as Role;

  const [item, setItem] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteBusy, setFavoriteBusy] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingBusy, setBookingBusy] = useState(false);
  const [form, setForm] = useState<BookingForm>(emptyBooking);

  // Private route: login na korle intended page-e ferat path diye login-e(pathano).
  useEffect(() => {
    if (isPending) return;
    if (!authenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(`/equipment/${id}`)}`);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");

      try {
        const data = await apiFetch<Equipment>(`/api/equipment/${id}`);
        if (!cancelled) setItem(data);
      } catch (err) {
        if (!cancelled) setError((err as Error).message || "Could not load equipment");
      } finally {
        if (!cancelled) setLoading(false);
      }

      if (role === "customer") {
        try {
          const list = await apiFetch<Equipment[]>("/api/customer/favorites");
          if (!cancelled) setIsFavorite(list.some((favorite) => favorite._id === id));
        } catch {
          // Favorites state is optional; details page should still render.
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, isPending, authenticated, role, router]);

  const toggleFavorite = async () => {
    if (!item) return;
    setFavoriteBusy(true);
    try {
      if (isFavorite) {
        await apiFetch(`/api/customer/favorites/${item._id}`, { method: "DELETE" });
        setIsFavorite(false);
        toast.success("Removed from favorites");
      } else {
        await apiFetch("/api/customer/favorites", {
          method: "POST",
          body: JSON.stringify({ equipmentId: item._id }),
        });
        setIsFavorite(true);
        toast.success("Added to favorites");
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setFavoriteBusy(false);
    }
  };

  const setField = (key: keyof BookingForm, value: string) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const preview =
    item && form.startDate && form.endDate
      ? rentalUnits(form.startDate, form.endDate, item.rentalType)
      : null;
  const quantity = Math.max(1, Number(form.quantity) || 1);
  const estimatedTotal =
    item && preview ? Number(item.rentalPrice || 0) * preview.units * quantity : null;

  const submitBooking = async () => {
    if (!item) return;

    if (!form.startDate || !form.endDate) {
      toast.error("Please choose rental start and end dates");
      return;
    }
    if (new Date(form.endDate).getTime() < new Date(form.startDate).getTime()) {
      toast.error("End date cannot be before start date");
      return;
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      toast.error("Quantity must be a positive whole number");
      return;
    }
    if (Number(item.quantity || 0) < quantity) {
      toast.error(`Only ${item.quantity ?? 0} available`);
      return;
    }

    setBookingBusy(true);
    try {
      const result = await apiFetch<{ checkoutUrl?: string; message?: string }>(
        "/api/customer/bookings",
        {
          method: "POST",
          body: JSON.stringify({
            equipmentId: item._id,
            startDate: form.startDate,
            endDate: form.endDate,
            quantity,
            phone: form.phone,
            deliveryAddress: form.deliveryAddress,
            notes: form.notes,
          }),
        }
      );

      if (!result.checkoutUrl) {
        throw new Error("Stripe checkout URL was not returned");
      }

      toast.success("Redirecting to secure checkout...");
      window.location.assign(result.checkoutUrl);
    } catch (err) {
      toast.error((err as Error).message || "Could not start payment");
      setBookingBusy(false);
    }
  };

  if (isPending || (!authenticated && !isPending)) {
    return (
      <main className="min-h-screen bg-[#F3EEE3] px-5 py-16 text-center text-[#6B6B6B]">
        Loading...
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F3EEE3] px-5 py-16 text-center text-[#6B6B6B]">
        Loading equipment details...
      </main>
    );
  }

  if (error || !item) {
    return (
      <main className="min-h-screen bg-[#F3EEE3] px-5 py-16">
        <div className="mx-auto max-w-xl rounded-2xl border border-[#D9D9D9] bg-white p-10 text-center">
          <h1 className="text-2xl text-[#111111]">Equipment unavailable</h1>
          <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-[#D9541E]" />
          <p className="mt-4 text-[#6B6B6B]">
            {error || "Equipment not found"}
          </p>
          <Link href="/equipment" className={`mt-6 inline-flex ${btnDark}`}>
            Browse all equipment
          </Link>
        </div>
      </main>
    );
  }

  const status = String(item.status || "Pending");
  const available = status.toLowerCase() === "approved" && Number(item.quantity || 0) > 0;
  const customerActions = role === "customer";

  return (
    <main className="min-h-screen bg-[#F3EEE3] pb-16 text-[#111111]">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
        <Link
          href="/equipment"
          className="inline-flex items-center gap-2 text-sm text-[#6B6B6B] transition-colors hover:text-[#D9541E]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all equipment
        </Link>

        <div className="mt-6">
          <PageHeader title={item.name} subtitle={`${item.category || "Equipment"} · ${item.location || "Location not provided"}`} />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          {/* Image */}
          <div className="overflow-hidden rounded-2xl border border-[#D9D9D9] bg-white">
            <div className="aspect-[4/3] w-full bg-[#F3EEE3]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={String(item.image || FALLBACK_IMAGE)}
                alt={item.name}
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.src = FALLBACK_IMAGE;
                }}
              />
            </div>
          </div>

          {/* Summary + actions */}
          <div className="rounded-2xl border border-[#D9D9D9] bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <StatusBadge value={status} />
              <span className="rounded-full px-3 py-1 text-xs bg-[#D9541E]/15 text-[#D9541E]">
                {available ? "Available" : "Not available"}
              </span>
            </div>

            <p className="mt-5 text-3xl text-[#111111]">
              ${money(item.rentalPrice)}
              <span className="text-base text-[#6B6B6B]"> / {item.rentalType || "Daily"}</span>
            </p>

            <p className="mt-3 flex items-center gap-2 text-sm text-[#6B6B6B]">
              <MapPin className="h-4 w-4 text-[#D9541E]" />
              {item.location || "Location not provided"}
            </p>
            <p className="mt-2 flex items-center gap-2 text-sm text-[#6B6B6B]">
              <Package className="h-4 w-4 text-[#D9541E]" />
              Available quantity: {item.quantity ?? 0}
            </p>

            {customerActions && (
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setBookingOpen(true)}
                  disabled={!available}
                  className={`${btnDark} px-6 py-3 text-sm`}
                >
                  Book Now
                </button>
                <button
                  type="button"
                  onClick={toggleFavorite}
                  disabled={favoriteBusy}
                  className={`${btnLight} inline-flex items-center gap-2 px-6 py-3 text-sm`}
                >
                  <Heart
                    className="h-4 w-4"
                    fill={isFavorite ? "#D9541E" : "none"}
                    stroke={isFavorite ? "#D9541E" : "#111111"}
                  />
                  {isFavorite ? "Remove Favorite" : "Add to Favorites"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Full equipment information */}
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section className="rounded-2xl border border-[#D9D9D9] bg-white p-6">
            <h2 className="flex items-center gap-2 text-xl text-[#111111]">
              <Wrench className="h-5 w-5 text-[#D9541E]" />
              Equipment information
            </h2>
            <dl className="mt-4">
              <Field label="Description" value={item.description} />
              <Field label="Category" value={item.category} />
              <Field label="Condition" value={item.condition} />
              <Field label="Brand" value={item.brand} />
              <Field label="Model" value={item.model} />
              <Field label="Rental type" value={item.rentalType} />
              <Field label="Quantity" value={item.quantity} />
            </dl>
          </section>

          <div className="space-y-8">
            <section className="rounded-2xl border border-[#D9D9D9] bg-white p-6">
              <h2 className="flex items-center gap-2 text-xl text-[#111111]">
                <Tag className="h-5 w-5 text-[#D9541E]" />
                Rental terms & conditions
              </h2>
              {item.terms ? (
                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-[#333333]">
                  {item.terms}
                </p>
              ) : (
                <p className="mt-4 text-sm text-[#6B6B6B]">
                  No rental terms were provided for this equipment.
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-[#D9D9D9] bg-white p-6">
              <h2 className="flex items-center gap-2 text-xl text-[#111111]">
                <UserRound className="h-5 w-5 text-[#D9541E]" />
                Owner information
              </h2>
              <dl className="mt-4">
                <Field label="Owner name" value={item.ownerName} />
                <Field label="Owner email" value={item.ownerEmail} />
              </dl>
            </section>
          </div>
        </div>
      </div>

      {/* Booking modal — uses existing Modal + backend booking API */}
      <Modal open={bookingOpen} onClose={() => setBookingOpen(false)} title="Book this equipment">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-[#333333]">
              Rental start date
              <input
                type="date"
                value={form.startDate}
                onChange={(event) => setField("startDate", event.target.value)}
                className={`mt-1 ${inputClass}`}
              />
            </label>
            <label className="block text-sm text-[#333333]">
              Rental end date
              <input
                type="date"
                value={form.endDate}
                onChange={(event) => setField("endDate", event.target.value)}
                className={`mt-1 ${inputClass}`}
              />
            </label>
          </div>

          <label className="block text-sm text-[#333333]">
            Required quantity
            <input
              type="number"
              min={1}
              max={item.quantity ?? 1}
              value={form.quantity}
              onChange={(event) => setField("quantity", event.target.value)}
              className={`mt-1 ${inputClass}`}
            />
          </label>

          <label className="block text-sm text-[#333333]">
            Contact number
            <input
              type="text"
              value={form.phone}
              onChange={(event) => setField("phone", event.target.value)}
              placeholder="Phone number"
              className={`mt-1 ${inputClass}`}
            />
          </label>

          <label className="block text-sm text-[#333333]">
            Delivery address
            <input
              type="text"
              value={form.deliveryAddress}
              onChange={(event) => setField("deliveryAddress", event.target.value)}
              placeholder="Where should the equipment be delivered?"
              className={`mt-1 ${inputClass}`}
            />
          </label>

          <label className="block text-sm text-[#333333]">
            Additional notes
            <textarea
              value={form.notes}
              onChange={(event) => setField("notes", event.target.value)}
              rows={3}
              placeholder="Anything the owner should know"
              className={`mt-1 ${inputClass}`}
            />
          </label>

          <div className="rounded-xl bg-[#F3EEE3] p-4 text-sm text-[#333333]">
            <p className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-[#D9541E]" />
              {preview
                ? `${preview.days} day(s) · ${preview.units} ${String(item.rentalType || "Daily").toLowerCase()} unit(s)`
                : "Choose dates to see the estimate"}
            </p>
            <p className="mt-2 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#D9541E]" />
              Estimated total:{" "}
              <strong className="text-[#111111]">
                ${estimatedTotal === null ? "—" : money(estimatedTotal)}
              </strong>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={submitBooking}
              disabled={bookingBusy}
              className={`${btnDark} px-6 py-3 text-sm`}
            >
              {bookingBusy ? "Opening secure checkout..." : "Confirm Booking"}
            </button>
            <button
              type="button"
              onClick={() => setBookingOpen(false)}
              className={`${btnLight} px-6 py-3 text-sm`}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
