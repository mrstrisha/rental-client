"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiFetch } from "@/lib/apiFetch";
import type { Booking } from "@/lib/types";
import { PageHeader, StatusBadge, daysBetween, fmtDate } from "@/app/component/Ui";

export default function AllRentalsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Page khulle shob booking ana
  useEffect(() => {
    apiFetch<Booking[]>("/api/admin/bookings")
      .then((data) => setBookings(data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  // 2. Booking status bodlano (dropdown theke)
  const handleStatusChange = async (id: string, status: string) => {
    try {
      await apiFetch(`/api/admin/bookings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setBookings(bookings.map((b) => (b._id === id ? { ...b, bookingStatus: status } : b)));
      toast.success(`Booking marked as ${status}`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div>
      <PageHeader title="All Rentals" subtitle="Monitor and manage every rental on the platform." />

      <div className="m-6 overflow-x-auto rounded-2xl border border-[#D9D9D9] bg-white">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="bg-[#F3EEE3] text-[#333333]">
            <tr>
              <th className="px-5 py-4 font-medium">Customer Information</th>
              <th className="px-5 py-4 font-medium">Owner Information</th>
              <th className="px-5 py-4 font-medium">Equipment Name</th>
              <th className="px-5 py-4 font-medium">Rental Duration</th>
              <th className="px-5 py-4 font-medium">Booking Amount</th>
              <th className="px-5 py-4 font-medium">Payment Status</th>
              <th className="px-5 py-4 font-medium">Booking Status</th>
              <th className="px-5 py-4 font-medium">Manage</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-[#6B6B6B]">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && bookings.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-[#6B6B6B]">
                  No rentals yet.
                </td>
              </tr>
            )}

            {bookings.map((b) => (
              <tr key={b._id} className="border-t border-[#D9D9D9]">
                <td className="px-5 py-4">
                  <p className="text-[#111111]">{b.customerName}</p>
                  <p className="text-xs text-[#6B6B6B]">{b.customerEmail}</p>
                </td>

                <td className="px-5 py-4">
                  <p className="text-[#111111]">{b.ownerName}</p>
                  <p className="text-xs text-[#6B6B6B]">{b.ownerEmail}</p>
                </td>

                <td className="px-5 py-4 text-[#333333]">{b.equipmentName}</td>

                <td className="px-5 py-4 text-[#333333]">
                  <p>
                    {fmtDate(b.startDate)} → {fmtDate(b.endDate)}
                  </p>
                  <p className="text-xs text-[#6B6B6B]">{daysBetween(b.startDate, b.endDate)} day(s)</p>
                </td>

                <td className="px-5 py-4 text-[#333333]">${b.totalAmount}</td>

                <td className="px-5 py-4">
                  <StatusBadge value={b.paymentStatus} />
                </td>

                <td className="px-5 py-4">
                  <StatusBadge value={b.bookingStatus} />
                </td>

                {/* Status bodlanor dropdown */}
                <td className="px-5 py-4">
                  <select
                    value={b.bookingStatus}
                    onChange={(e) => handleStatusChange(b._id, e.target.value)}
                    className="rounded-lg border border-[#D9D9D9] bg-white px-3 py-2 text-sm capitalize outline-none focus:border-[#D9541E]"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}