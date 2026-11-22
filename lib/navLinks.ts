// Kon role er jonno kon link dekhabe, shob ekhane.
// Route gulo tomar project er folder name onujai change korte paro.

export type Role = "guest" | "customer" | "owner" | "admin";

export type NavLink = {
  label: string;
  href: string;
  exact?: boolean; // true hole shudhu oi exact page e "active" hobe
};

// Session user er actual role upor bhitti kore dashboard route bicchho kore.
export function dashboardUrlForRole(role?: string | null): string {
  const normalized = String(role ?? "").toLowerCase();
  if (normalized === "admin") return "/Dashboard/admin";
  if (normalized === "owner") return "/Dashboard/owner";
  return "/Dashboard/customer";
}

export const navLinks: Record<Role, NavLink[]> = {
  guest: [
    { label: "Home", href: "/", exact: true },
    { label: "Browse Equipment", href: "/equipment" },
  ],

  customer: [
    { label: "Home", href: "/", exact: true },
    { label: "Browse Equipment", href: "/equipment" },
    { label: "My Bookings", href: "/dashboard/customer/bookings" },
    { label: "My Reviews", href: "/dashboard/customer/reviews" },
  ],

  owner: [
    { label: "Home", href: "/", exact: true },
    { label: "Browse Equipment", href: "/equipment" },
    { label: "My Equipment", href: "/dashboard/owner/equipment" },
    { label: "Add Equipment", href: "/dashboard/owner/add-equipment" },
    { label: "Manage Bookings", href: "/dashboard/owner/bookings" },
  ],

  admin: [
    { label: "Home", href: "/", exact: true },
    { label: "Dashboard", href: "/dashboard/admin", exact: true },
    { label: "Manage Users", href: "/dashboard/admin/users" },
    { label: "Manage Equipment", href: "/dashboard/admin/equipment" },
    { label: "Manage Bookings", href: "/dashboard/admin/bookings" },
    { label: "Reports", href: "/dashboard/admin/reports" },
  ],
};

// Profile shob logged in user er jonno same page
export const profileHref = "/dashboard/profile";