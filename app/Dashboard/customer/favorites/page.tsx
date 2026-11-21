"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { apiFetch } from "@/lib/apiFetch";
import type { Equipment } from "@/lib/types";
import { PageHeader, btnDark, btnLight } from "@/app/component/Ui";

export default function FavoritesPage() {
  // items = customer er favorite equipment
  const [items, setItems] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Page khulle favorite list ana
  useEffect(() => {
    apiFetch<Equipment[]>("/api/customer/favorites")
      .then((data) => setItems(data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  // 2. Remove Favorite
  const handleRemove = async (id: string) => {
    try {
      await apiFetch(`/api/customer/favorites/${id}`, { method: "DELETE" });
      // table theke oi item ta soriye dao
      setItems(items.filter((item) => item._id !== id));
      toast.success("Removed from favorites");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div>
      <PageHeader title="Favorites" subtitle="Equipment you saved for later." />

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[#D9D9D9] bg-white">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-[#F3EEE3] text-[#333333]">
            <tr>
              <th className="px-5 py-4 font-medium">Equipment</th>
              <th className="px-5 py-4 font-medium">Category</th>
              <th className="px-5 py-4 font-medium">Rental Price</th>
              <th className="px-5 py-4 font-medium">Location</th>
              <th className="px-5 py-4 font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-[#6B6B6B]">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-[#6B6B6B]">
                  You have no favorite equipment yet.
                </td>
              </tr>
            )}

            {items.map((item) => (
              <tr key={item._id} className="border-t border-[#D9D9D9]">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />
                    <span className="text-[#111111]">{item.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-[#333333]">{item.category}</td>
                <td className="px-5 py-4 text-[#333333]">
                  ${item.rentalPrice} / {item.rentalType}
                </td>
                <td className="px-5 py-4 text-[#333333]">{item.location}</td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <Link href={`/equipment/${item._id}`} className={btnDark}>
                      View Details
                    </Link>
                    <button onClick={() => handleRemove(item._id)} className={btnLight}>
                      Remove Favorite
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}