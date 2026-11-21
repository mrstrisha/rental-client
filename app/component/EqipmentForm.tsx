"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { apiFetch } from "@/lib/apiFetch";
import { CATEGORIES, CONDITIONS } from "@/lib/types";
import { btnDark, inputClass } from "@/app/component/Ui";

type ChangeEv = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="mb-1 block text-sm text-[#333333]">{label}</label>
      {children}
    </div>
  );
}

export default function AddEquipmentForm(props: any)  {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: CATEGORIES[0],
    location: "",
    rentalPrice: "",
    rentalType: "Daily",
    quantity: "",
    condition: CONDITIONS[2],
    brand: "",
    model: "",
    image: "",
    terms: "",
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // set("name") -> input er onChange
  const set = (key: keyof typeof form) => (e: ChangeEv) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  // imgbb te image upload
  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_KEY}`, {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!json.success) throw new Error("Image upload failed");

      setForm((p) => ({ ...p, image: json.data.url }));
      toast.success("Image uploaded");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  // Submit korle server e pathay
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.image) {
      toast.error("Please upload an image first");
      return;
    }
    const price = Number(form.rentalPrice);
    const qty = Number(form.quantity);
    if (!(price > 0) || !(qty > 0)) {
      toast.error("Price and quantity must be more than 0");
      return;
    }

    setSaving(true);
    try {
      await apiFetch("/api/owner/equipment", {
        method: "POST",
        body: JSON.stringify({ ...form, rentalPrice: price, quantity: qty }),
      });
      toast.success("Equipment added. Waiting for admin approval.");
      router.push("/dashboard/owner/equipment");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="m-6 grid max-w-3xl gap-5 rounded-2xl border border-[#D9D9D9] bg-white p-6 md:grid-cols-2">
      <Field label="Equipment name">
        <input required value={form.name} onChange={set("name")} className={inputClass} />
      </Field>

      <Field label="Category">
        <select value={form.category} onChange={set("category")} className={inputClass}>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </Field>

      <Field label="Location">
        <input required value={form.location} onChange={set("location")} className={inputClass} />
      </Field>

      <Field label="Equipment condition">
        <select value={form.condition} onChange={set("condition")} className={inputClass}>
          {CONDITIONS.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </Field>

      <Field label="Rental price ($)">
        <input required type="number" min="1" value={form.rentalPrice} onChange={set("rentalPrice")} className={inputClass} />
      </Field>

      <Field label="Rental type">
        <select value={form.rentalType} onChange={set("rentalType")} className={inputClass}>
          <option>Daily</option>
          <option>Weekly</option>
          <option>Monthly</option>
        </select>
      </Field>

      <Field label="Available quantity">
        <input required type="number" min="1" value={form.quantity} onChange={set("quantity")} className={inputClass} />
      </Field>

      <Field label="Brand">
        <input required value={form.brand} onChange={set("brand")} className={inputClass} />
      </Field>

      <Field label="Model">
        <input required value={form.model} onChange={set("model")} className={inputClass} />
      </Field>

      <Field label="Equipment image">
        <input type="file" accept="image/*" onChange={handleImage} className={`${inputClass} text-sm`} />
        {uploading && <p className="mt-1 text-xs text-[#D9541E]">Uploading...</p>}
      </Field>

      {form.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={form.image} alt="Preview" className="h-40 w-full rounded-xl object-cover md:col-span-2" />
      )}

      <Field label="Description" full>
        <textarea required rows={3} value={form.description} onChange={set("description")} className={inputClass} />
      </Field>

      <Field label="Rental terms and conditions" full>
        <textarea required rows={3} value={form.terms} onChange={set("terms")} className={inputClass} />
      </Field>

      <p className="text-xs text-[#6B6B6B] md:col-span-2">
        Owner information and the status (Pending) are added automatically. An admin has to approve the equipment
        before it goes live.
      </p>

      <div className="md:col-span-2">
        <button type="submit" disabled={saving || uploading} className={`${btnDark} px-8 py-3 text-sm`}>
          {saving ? "Saving..." : "Add Equipment"}
        </button>
      </div>
    </form>
  );
}