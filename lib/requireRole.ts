import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth"; // tomar existing Better Auth server config
import type { Role } from "@/lib/navLinks";

type AllowedRole = Exclude<Role, "guest">; // "customer" | "owner" | "admin"

// Server e role check kore. Navbar e link hide kora security na,
// tai protected page er layout.tsx e eta use korte hobe.
export async function requireRole(allowedRoles: AllowedRole[]) {
  const session = await auth.api.getSession({ headers: await headers() });

  // Login nai hole login page e
  if (!session) redirect("/login");

  const role = ((session.user as { role?: string }).role ?? "customer").toLowerCase();

  // Role match na korle home e pathiye dibe
  if (!allowedRoles.includes(role as AllowedRole)) redirect("/");

  return session;
}

/*
  Ba-bohar (usage) - ekta ekta folder e layout.tsx banao:

  // app/dashboard/admin/layout.tsx
  import { requireRole } from "@/lib/requireRole";

  export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    await requireRole(["admin"]);
    return <>{children}</>;
  }

  // app/dashboard/owner/layout.tsx    -> requireRole(["owner"])
  // app/dashboard/customer/layout.tsx -> requireRole(["customer"])
  // app/dashboard/profile/layout.tsx  -> requireRole(["customer", "owner", "admin"])
*/