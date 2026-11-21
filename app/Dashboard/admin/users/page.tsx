
"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/apiFetch";
import { PageHeader, btnLight, fmtDate } from "@/app/component/Ui";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
};

export default function AllUsersPage() {
  // Nijer id (nijer role bodlano ba delete kora jabe na)
  const { data: session } = authClient.useSession();
  const myId = session?.user?.id;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Page khulle shob user ana
  useEffect(() => {
    apiFetch<User[]>("/api/admin/users")
      .then((data) => setUsers(data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  // 2. Role bodlano (dropdown theke)
  const handleRoleChange = async (user: User, newRole: string) => {
    try {
      await apiFetch(`/api/admin/users/${user.id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });
      // table e role update koro
      setUsers(users.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)));
      toast.success(`${user.name} is now ${newRole}`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  // 3. User delete (Manage Users)
  const handleDelete = async (user: User) => {
    if (!confirm(`Delete ${user.name}? This cannot be undone.`)) return;

    try {
      await apiFetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      setUsers(users.filter((u) => u.id !== user.id));
      toast.success("User deleted");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div>
      <PageHeader title="All Users" subtitle="Change roles or remove users." />

      <div className="m-6 overflow-x-auto rounded-2xl border border-[#D9D9D9] bg-white">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-[#F3EEE3] text-[#333333]">
            <tr>
              <th className="px-5 py-4 font-medium">Name</th>
              <th className="px-5 py-4 font-medium">Email</th>
              <th className="px-5 py-4 font-medium">Role</th>
              <th className="px-5 py-4 font-medium">Registration Date</th>
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

            {users.map((user) => {
              const isMe = user.id === myId;

              return (
                <tr key={user.id} className="border-t border-[#D9D9D9]">
                  <td className="px-5 py-4 text-[#111111]">
                    {user.name} {isMe && <span className="text-xs text-[#6B6B6B]">(you)</span>}
                  </td>
                  <td className="px-5 py-4 text-[#333333]">{user.email}</td>

                  {/* Role dropdown */}
                  <td className="px-5 py-4">
                    <select
                      value={user.role}
                      disabled={isMe}
                      onChange={(e) => handleRoleChange(user, e.target.value)}
                      className="rounded-lg border border-[#D9D9D9] bg-white px-3 py-2 text-sm capitalize outline-none focus:border-[#D9541E] disabled:cursor-not-allowed disabled:bg-[#F3EEE3]"
                    >
                      <option value="customer">Customer</option>
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>

                  <td className="px-5 py-4 text-[#333333]">{fmtDate(user.createdAt)}</td>

                  <td className="px-5 py-4">
                    {isMe ? (
                      <span className="text-xs text-[#6B6B6B]">Protected</span>
                    ) : (
                      <button onClick={() => handleDelete(user)} className={btnLight}>
                        Delete User
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}                                       