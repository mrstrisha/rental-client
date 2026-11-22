"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";

// inDashboard = dashboard er bhitore dekhaite hole true. leading = bar er shurute ja boshbe (sidebar button).
export default function Navbar({
  inDashboard = false,
  leading,
}: {
  inDashboard?: boolean;
  leading?: React.ReactNode;
}) {
  // Login kora user (na thakle undefined)
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false); // mobile menu
  const [dropOpen, setDropOpen] = useState(false); // user dropdown
  const dropRef = useRef<HTMLDivElement>(null);

  // 1. User er role (database theke ashe). Na thakle customer.
  const rawRole = String((user as { role?: string } | undefined)?.role ?? "customer").toLowerCase();
  const role = rawRole === "admin" || rawRole === "owner" ? rawRole : "customer";

  // 2. "My Dashboard" e click korle role onujayi alada dashboard e jabe
  const dashboardLink =
    role === "admin"
      ? "/Dashboard/admin/users"
      : role === "owner"
      ? "/Dashboard/owner/equipment"
      : "/Dashboard/customer/rentals";

  // 3. Navbar er link gulo. My Dashboard shudhu login thakle dekhabe.
  const links = [
    { label: "Home", href: "/" },
    { label: "Browse Equipment", href: "/equipment" },
    ...(user ? [{ label: "My Dashboard", href: dashboardLink }] : []),
  ];

  // Page bodlale menu bondho
  useEffect(() => {
    setMobileOpen(false);
    setDropOpen(false);
  }, [pathname]);

  // Dropdown er baire click korle bondho
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // Logout
  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
      },
    });
  };

  // 4. Login ar SignUp page e navbar dekhabe na.
  // Dashboard e shudhu tokhon dekhabe jokhon dashboard layout nije <Navbar inDashboard /> boshay.
  const path = pathname.toLowerCase();
  if (path === "/login" || path === "/signup" || (path.startsWith("/dashboard") && !inDashboard)) {
    return null;
  }

  // Active link check (My Dashboard dashboard er shob page e active thakbe)
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/dashboard")) return pathname.startsWith("/dashboard");
    return pathname.startsWith(href);
  };

  const linkClass = (active: boolean) =>
    `rounded-full px-4 py-2 text-sm transition-all duration-300 ${
      active ? "bg-[#111111] text-[#F3EEE3]" : "text-[#333333] hover:bg-[#111111]/5 hover:text-[#D9541E]"
    }`;

  const initial = (user?.name || user?.email || "U").charAt(0).toUpperCase();

  return (
    // mb-6 = navbar er niche gap, jate niche er content/hero ghesha na thake
    <header className="sticky top-0 z-50 mb-6 px-4 pt-4">
      {/* ---------- Main bar ---------- */}
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between rounded-full border border-[#D9D9D9] bg-[#F3EEE3]/85 px-5 shadow-sm backdrop-blur-md">
        {/* Sidebar button (shudhu dashboard e) + Logo + naam */}
        <div className="flex items-center gap-3">
          {leading}
          <Link href="/" className="flex items-center gap-3">
            <span className="h-5 w-5 rounded-full rounded-bl-sm bg-[#D9541E]" />
            <span className="text-xl font-medium tracking-wide text-[#111111]">Gearly</span>
          </Link>
        </div>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <li key={link.label}>
              <Link href={link.href} className={linkClass(isActive(link.href))}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop right side */}
        <div className="hidden items-center gap-2 md:flex">
          {/* Loading */}
          {isPending && <div className="h-10 w-28 animate-pulse rounded-full bg-[#D9D9D9]" />}

          {/* Login kora nai: Login + Sign Up */}
          {!isPending && !user && (
            <>
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm text-[#111111] transition-colors hover:text-[#D9541E]"
              >
                Login
              </Link>
              <Link
                href="/signUp"
                className="rounded-full bg-[#0B0B0B] px-5 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#D9541E] hover:shadow-lg"
              >
                Sign Up
              </Link>
            </>
          )}

          {/* Login kora: user er info */}
          {!isPending && user && (
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-3 rounded-full border border-[#D9D9D9] bg-white py-1 pl-1 pr-4 transition-all duration-300 hover:border-[#D9541E]"
              >
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.image} alt={user.name} className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-[#111111] text-sm text-[#F3EEE3]">
                    {initial}
                  </span>
                )}
                <span className="text-left leading-tight">
                  <span className="block max-w-[110px] truncate text-sm text-[#111111]">{user.name}</span>
                  <span className="block text-[11px] capitalize text-[#D9541E]">{role}</span>
                </span>
              </button>

              {/* Dropdown */}
              <div
                className={`absolute right-0 mt-3 w-64 origin-top-right rounded-2xl border border-[#D9D9D9] bg-white p-2 shadow-xl transition-all duration-200 ${
                  dropOpen ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
                }`}
              >
                <div className="px-3 py-3">
                  <p className="truncate text-sm text-[#111111]">{user.name}</p>
                  <p className="truncate text-xs text-[#6B6B6B]">{user.email}</p>
                </div>
                <div className="h-px bg-[#D9D9D9]" />
                <Link
                  href="/dashboard/profile"
                  className="mt-2 block rounded-xl px-3 py-2.5 text-sm text-[#333333] transition-colors hover:bg-[#F3EEE3] hover:text-[#D9541E]"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full rounded-xl px-3 py-2.5 text-left text-sm text-[#333333] transition-colors hover:bg-[#F3EEE3] hover:text-[#D9541E]"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full border border-[#D9D9D9] bg-white md:hidden"
        >
          <span className={`h-0.5 w-5 bg-[#111111] transition-all duration-300 ${mobileOpen ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`h-0.5 w-5 bg-[#111111] transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
          <span className={`h-0.5 w-5 bg-[#111111] transition-all duration-300 ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </nav>

      {/* ---------- Mobile menu ---------- */}
      {mobileOpen && (
        <div className="mx-auto mt-3 max-w-7xl rounded-3xl border border-[#D9D9D9] bg-white p-4 shadow-xl md:hidden">
          <div className="space-y-1">
            {links.map((link) => (
              <Link key={link.label} href={link.href} className={`block ${linkClass(isActive(link.href))}`}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="my-4 h-px bg-[#D9D9D9]" />

          {isPending && <div className="h-10 animate-pulse rounded-full bg-[#D9D9D9]" />}

          {/* Login kora nai */}
          {!isPending && !user && (
            <div className="flex gap-3">
              <Link
                href="/login"
                className="flex-1 rounded-full border border-[#111111] py-3 text-center text-sm text-[#111111]"
              >
                Login
              </Link>
              <Link
                href="/signUp"
                className="flex-1 rounded-full bg-[#0B0B0B] py-3 text-center text-sm text-white hover:bg-[#D9541E]"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Login kora */}
          {!isPending && user && (
            <div>
              <div className="mb-3 flex items-center gap-3 px-2">
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.image} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-[#111111] text-sm text-[#F3EEE3]">
                    {initial}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm text-[#111111]">{user.name}</p>
                  <p className="truncate text-xs text-[#6B6B6B]">
                    {user.email} · <span className="capitalize text-[#D9541E]">{role}</span>
                  </p>
                </div>
              </div>
              <Link href="/dashboard/profile" className="block rounded-full px-4 py-2 text-sm text-[#333333] hover:text-[#D9541E]">
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full rounded-full px-4 py-2 text-left text-sm text-[#333333] hover:text-[#D9541E]"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}