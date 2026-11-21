

"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiFetch } from "@/lib/apiFetch";
import type { Booking } from "@/lib/types";
import { PageHeader, StatusBadge, daysBetween, fmtDate } from "@/app/component/Ui";

export default function MyEquipmentRentalPage() {
  // bookings = owner er equipment e jara booking korese
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Page khulle server theke booking ana
  useEffect(() => {
    apiFetch<Booking[]>("/api/owner/bookings")
      .then((data) => setBookings(data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="My Equipment Rental" subtitle="Bookings made on your equipment." />

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[#D9D9D9] bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-[#F3EEE3] text-[#333333]">
            <tr>
              <th className="px-5 py-4 font-medium">Customer Information</th>
              <th className="px-5 py-4 font-medium">Equipment Information</th>
              <th className="px-5 py-4 font-medium">Rental Duration</th>
              <th className="px-5 py-4 font-medium">Required Quantity</th>
              <th className="px-5 py-4 font-medium">Booking Amount</th>
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
                  No one has booked your equipment yet.
                </td>
              </tr>
            )}

            {bookings.map((b) => (
              <tr key={b._id} className="border-t border-[#D9D9D9]">
                {/* Customer */}
                <td className="px-5 py-4">
                  <p className="text-[#111111]">{b.customerName}</p>
                  <p className="text-xs text-[#6B6B6B]">{b.customerEmail}</p>
                  <p className="text-xs text-[#6B6B6B]">{b.phone}</p>
                </td>

                {/* Equipment */}
                <td className="px-5 py-4 text-[#333333]">{b.equipmentName}</td>

                {/* Duration */}
                <td className="px-5 py-4 text-[#333333]">
                  <p>
                    {fmtDate(b.startDate)} → {fmtDate(b.endDate)}
                  </p>
                  <p className="text-xs text-[#6B6B6B]">{daysBetween(b.startDate, b.endDate)} day(s)</p>
                </td>

                <td className="px-5 py-4 text-[#333333]">{b.quantity}</td>
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