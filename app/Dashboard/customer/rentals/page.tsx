"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiFetch } from "@/lib/apiFetch";
import type { Booking } from "@/lib/types";
import { PageHeader, StatusBadge, fmtDate } from "@/app/component/Ui";

export default function MyRentalsPage() {
  // bookings = ei customer er shob booking
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Page khulle server theke booking ana
  useEffect(() => {
    apiFetch<Booking[]>("/api/customer/bookings")
      .then((data) => setBookings(data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="My Rentals" subtitle="All your rental bookings in one place." />

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[#D9D9D9] bg-white">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-[#F3EEE3] text-[#333333]">
            <tr>
              <th className="px-5 py-4 font-medium">Equipment Name</th>
              <th className="px-5 py-4 font-medium">Rental Start Date</th>
              <th className="px-5 py-4 font-medium">Rental End Date</th>
              <th className="px-5 py-4 font-medium">Booking Date</th>
              <th className="px-5 py-4 font-medium">Total Amount</th>
              <th className="px-5 py-4 font-medium">Payment Status</th>
              <th className="px-5 py-4 font-medium">Booking Status</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-[#6B6B6B]">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && bookings.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-[#6B6B6B]">
                  You have not rented anything yet.
                </td>
              </tr>
            )}

            {bookings.map((b) => (
              <tr key={b._id} className="border-t border-[#D9D9D9]">
                <td className="px-5 py-4 text-[#111111]">{b.equipmentName}</td>
                <td className="px-5 py-4 text-[#333333]">{fmtDate(b.startDate)}</td>
                <td className="px-5 py-4 text-[#333333]">{fmtDate(b.endDate)}</td>
                <td className="px-5 py-4 text-[#333333]">{fmtDate(b.createdAt)}</td>
                <td className="px-5 py-4 text-[#333333]">${b.totalAmount}</td>
                <td className="px-5 py-4">
                  <StatusBadge value={b.paymentStatus} />
                </td>
                <td className="px-5 py-4">
                  <StatusBadge value={b.bookingStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}