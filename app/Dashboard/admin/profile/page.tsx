"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/apiFetch";
import { PageHeader, btnDark, inputClass } from "@/app/component/Ui";

export default function ProfilePage() {
  // Form er shob value ekta object e
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    image: "",
    phone: "",
    address: "",
    role: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1. Page khulle server theke profile ana
  useEffect(() => {
    apiFetch<typeof profile>("/api/profile")
      .then((data) => setProfile(data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  // 2. Input e likhle value update hoy. handleChange("name") -> name field er jonno
  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setProfile({ ...profile, [field]: e.target.value });
    };

  // 3. Save button
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setSaving(true);
    try {
      // Name ar photo Better Auth e save hoy (navbar e sathe sathe bodle jay)
      await authClient.updateUser({ name: profile.name, image: profile.image });

      // Phone ar address amader server e save hoy
      await apiFetch("/api/profile", {
        method: "PUT",
        body: JSON.stringify({ phone: profile.phone, address: profile.address }),
      });

      toast.success("Profile updated");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-[#6B6B6B]">Loading profile...</p>;

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Keep your details up to date." />

      <form onSubmit={handleSave} className="m-6 max-w-2xl rounded-2xl border border-[#D9D9D9] bg-white p-6">
        {/* Photo ar naam */}
        <div className="mb-6 flex items-center gap-4">
          {profile.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.image} alt="Profile" className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <span className="grid h-20 w-20 place-items-center rounded-full bg-[#111111] text-2xl text-[#F3EEE3]">
              {profile.name.charAt(0).toUpperCase()}
            </span>
          )}
          <div>
            <p className="text-lg text-[#111111]">{profile.name}</p>
            <span className="rounded-full bg-[#D9541E]/15 px-3 py-0.5 text-xs capitalize text-[#D9541E]">
              {profile.role}
            </span>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-[#333333]">Name</label>
            <input value={profile.name} onChange={handleChange("name")} className={inputClass} />
          </div>

          <div>
            <label className="mb-1 block text-sm text-[#333333]">Email</label>
            {/* Email bodlano jay na, tai disabled */}
            <input value={profile.email} disabled className={`${inputClass} cursor-not-allowed bg-[#F3EEE3]`} />
          </div>

          <div>
            <label className="mb-1 block text-sm text-[#333333]">Phone number</label>
            <input value={profile.phone} onChange={handleChange("phone")} className={inputClass} />
          </div>

          <div>
            <label className="mb-1 block text-sm text-[#333333]">Profile image URL</label>
            <input value={profile.image} onChange={handleChange("image")} className={inputClass} />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-[#333333]">Address</label>
            <textarea rows={3} value={profile.address} onChange={handleChange("address")} className={inputClass} />
          </div>
        </div>

        <button type="submit" disabled={saving} className={`${btnDark} mt-6 px-8 py-3 text-sm`}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}