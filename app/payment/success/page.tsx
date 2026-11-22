"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { apiFetch } from "@/lib/apiFetch";
import type { Booking } from "@/lib/types";
import { PageHeader, StatusBadge, btnDark, btnLight } from "@/app/component/Ui";

type PaymentBooking = Booking & {
  stripeSessionId?: string;
  stripePaymentIntentId?: string | null;
  amountPaid?: number;
  currency?: string;
  paidAt?: string;
};

type PaymentState = "loading" | "paid" | "pending" | "cancelled" | "error";

function money(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? amount.toLocaleString("en-US", { maximumFractionDigits: 2 })
    : "—";
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const cancelled = searchParams.get("canceled") === "1";
  const [state, setState] = useState<PaymentState>("loading");
  const [booking, setBooking] = useState<PaymentBooking | null>(null);

  useEffect(() => {
    if (!sessionId || cancelled) return;

    let cancelledLoad = false;

    const loadBooking = async () => {
      try {
        const bookings = await apiFetch<PaymentBooking[]>("/api/customer/bookings");
        const match = bookings.find((item) => item.stripeSessionId === sessionId) || null;
        if (cancelledLoad) return;
        setBooking(match);
        setState(match?.paymentStatus === "paid" ? "paid" : "pending");
      } catch {
        if (!cancelledLoad) setState("error");
      }
    };

    void loadBooking();

    return () => {
      cancelledLoad = true;
    };
  }, [sessionId, cancelled]);

  const cardClass =
    "rounded-2xl border border-[#D9D9D9] bg-white p-8 text-center shadow-sm";
  const currentState: PaymentState = !sessionId ? "error" : cancelled ? "cancelled" : state;

  return (
    <main className="min-h-screen bg-[#F3EEE3] px-5 py-14 text-[#111111]">
      <div className="mx-auto max-w-2xl">
        <PageHeader
          title="Payment status"
          subtitle="Stripe payment confirmation for your equipment rental."
        />

        <div className="mt-8">
          {currentState === "loading" && (
            <div className={cardClass}>
              <Clock3 className="mx-auto h-10 w-10 text-[#D9541E]" />
              <h2 className="mt-4 text-xl">Checking payment status...</h2>
              <p className="mt-2 text-sm text-[#6B6B6B]">
                This page only reads the verified status from the server.
              </p>
            </div>
          )}

          {currentState === "paid" && (
            <div className={cardClass}>
              <CheckCircle2 className="mx-auto h-10 w-10 text-[#D9541E]" />
              <h2 className="mt-4 text-2xl">Payment confirmed</h2>
              <p className="mt-2 text-sm text-[#6B6B6B]">
                Stripe verified your payment and your booking is confirmed.
              </p>
              {booking && (
                <div className="mt-6 rounded-xl bg-[#F3EEE3] p-5 text-left text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[#6B6B6B]">Equipment</span>
                    <strong>{booking.equipmentName}</strong>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-[#6B6B6B]">Amount paid</span>
                    <strong>${money(booking.amountPaid ?? booking.totalAmount)}</strong>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-[#6B6B6B]">Payment</span>
                    <StatusBadge value={booking.paymentStatus} />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-[#6B6B6B]">Booking</span>
                    <StatusBadge value={booking.bookingStatus} />
                  </div>
                </div>
              )}
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link href="/Dashboard/customer/rentals" className={btnDark}>
                  View my rentals
                </Link>
                <Link href="/equipment" className={btnLight}>
                  Browse equipment
                </Link>
              </div>
            </div>
          )}

          {currentState === "pending" && (
            <div className={cardClass}>
              <Clock3 className="mx-auto h-10 w-10 text-[#D9541E]" />
              <h2 className="mt-4 text-2xl">Payment verification pending</h2>
              <p className="mt-2 text-sm text-[#6B6B6B]">
                Stripe has not sent the verified webhook yet. This page will not mark a booking as
                paid on its own.
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className={`mt-7 ${btnDark}`}
              >
                Refresh status
              </button>
            </div>
          )}

          {currentState === "cancelled" && (
            <div className={cardClass}>
              <XCircle className="mx-auto h-10 w-10 text-[#D9541E]" />
              <h2 className="mt-4 text-2xl">Payment cancelled</h2>
              <p className="mt-2 text-sm text-[#6B6B6B]">
                You left Stripe Checkout before completing the payment. No payment was confirmed.
              </p>
              <Link href="/equipment" className={`mt-7 inline-flex ${btnDark}`}>
                Back to equipment
              </Link>
            </div>
          )}

          {currentState === "error" && (
            <div className={cardClass}>
              <XCircle className="mx-auto h-10 w-10 text-[#D9541E]" />
              <h2 className="mt-4 text-2xl">Could not check payment status</h2>
              <p className="mt-2 text-sm text-[#6B6B6B]">
                {sessionId
                  ? "Please try again or check your rentals page."
                  : "This page needs a Stripe Checkout Session ID."}
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={() => window.location.reload()} className={btnDark}>
                  Try again
                </button>
                <Link href="/Dashboard/customer/rentals" className={btnLight}>
                  View my rentals
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#F3EEE3] px-5 py-16 text-center text-[#6B6B6B]">
          Loading payment status...
        </main>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
