
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { apiFetch } from "@/lib/apiFetch";
import type { Equipment, EquipmentInput } from "@/lib/types";
// import EquipmentForm from "@/app/component/EquipmentForm";
import { PageHeader, StatusBadge, btnDark, btnLight } from "@/app/component/Ui";
import AddEquipmentForm from "@/app/component/EqipmentForm";

export default function AllEquipmentPage() {
  const [items, setItems] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  // editing = je equipment ta update hocche (null mane popup bondho)
  const [editing, setEditing] = useState<Equipment | null>(null);

  // 1. Page khulle shob equipment ana
  const loadItems = useCallback(async () => {
    const data = await apiFetch<Equipment[]>("/api/admin/equipment");
    setItems(data);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await apiFetch<Equipment[]>("/api/admin/equipment");
        if (!cancelled) setItems(data);
      } catch (err) {
        if (!cancelled) toast.error((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // 2. Approve / Reject
  const handleStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      await apiFetch(`/api/admin/equipment/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await loadItems();
      toast.success(`Equipment ${status}`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  // 3. Update (popup er form submit korle chole)
  const handleUpdate = async (values: EquipmentInput) => {
    if (!editing) return;

    try {
      await apiFetch(`/api/admin/equipment/${editing._id}`, {
        method: "PUT",
        body: JSON.stringify(values),
      });
      await loadItems();
      toast.success("Equipment updated");
      setEditing(null);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  // 4. Delete
  const handleDelete = async (item: Equipment) => {
    if (!confirm(`Delete "${item.name}"?`)) return;

    try {
      await apiFetch(`/api/admin/equipment/${item._id}`, { method: "DELETE" });
      await loadItems();
      toast.success("Equipment deleted");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div>
      <PageHeader title="All Equipment" subtitle="Approve, reject or manage every listing." />

      <div className="m-6 overflow-x-auto rounded-2xl border border-[#D9D9D9] bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-[#F3EEE3] text-[#333333]">
            <tr>
              <th className="px-5 py-4 font-medium">Equipment</th>
              <th className="px-5 py-4 font-medium">Owner</th>
              <th className="px-5 py-4 font-medium">Category</th>
              <th className="px-5 py-4 font-medium">Price</th>
              <th className="px-5 py-4 font-medium">Qty</th>
              <th className="px-5 py-4 font-medium">Status</th>
              <th className="px-5 py-4 font-medium">Actions</th>
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

            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-[#6B6B6B]">
                  No equipment found.
                </td>
              </tr>
            )}

            {items.map((item) => {
              const status = String(item.status).toLowerCase();

              return (
                <tr key={item._id} className="border-t border-[#D9D9D9]">
                  <td className="px-5 py-4 text-[#111111]">{item.name}</td>
                  <td className="px-5 py-4 text-[#333333]">
                    <p>{item.ownerName}</p>
                    <p className="text-xs text-[#6B6B6B]">{item.ownerEmail}</p>
                  </td>
                  <td className="px-5 py-4 text-[#333333]">{item.category}</td>
                  <td className="px-5 py-4 text-[#333333]">
                    ${item.rentalPrice} / {item.rentalType}
                  </td>
                  <td className="px-5 py-4 text-[#333333]">{item.quantity}</td>
                  <td className="px-5 py-4">
                    <StatusBadge value={status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/equipment/${item._id}`} className={btnLight}>
                        View Details
                      </Link>
                      <button
                        disabled={status === "approved"}
                        onClick={() => handleStatus(item._id, "approved")}
                        className={btnDark}
                      >
                        Approve
                      </button>
                      <button
                        disabled={status === "rejected"}
                        onClick={() => handleStatus(item._id, "rejected")}
                        className={btnLight}
                      >
                        Reject
                      </button>
                      <button onClick={() => setEditing(item)} className={btnLight}>
                        Update
                      </button>
                      <button onClick={() => handleDelete(item)} className={btnLight}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Update popup */}
      {editing && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/50 p-4">
          <div className="mx-auto my-8 max-w-2xl rounded-2xl bg-[#F3EEE3] p-4">
            <div className="flex items-center justify-between px-4 pt-2">
              <h2 className="text-xl text-[#111111]">Update Equipment</h2>
              <button onClick={() => setEditing(null)} className="text-2xl text-[#6B6B6B] hover:text-[#D9541E]">
                ×
              </button>
            </div>

            <AddEquipmentForm
              key={editing._id}
              initial={editing}
              submitLabel="Save Changes"
              onSubmit={handleUpdate}
            />
          </div>
        </div>
      )}
    </div>
  );
}