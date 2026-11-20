"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client"; // tomar existing Better Auth client
import { navLinks, profileHref } from "@/lib/navLinks";
import type { NavLink, Role } from "@/lib/navLinks";

export default function Navbar() {
  // 1. Better Auth theke session ana (refresh dileo thake, cookie te save)
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  // 2. Role database er user theke ashe.
  // (user as ...) kora hoyeche jate TypeScript "role" field chine.
  const rawRole = ((user as { role?: string } | undefined)?.role ?? "customer").toLowerCase();
  const role: Role = !user
    ? "guest"
    : rawRole === "owner" || rawRole === "admin"
    ? rawRole
    : "customer";
  const links: NavLink[] = navLinks[role];

  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [dropOpen, setDropOpen] = useState<boolean>(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // Page change hole menu gulo bondho
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

  // Active link check
  const isActive = (link: NavLink): boolean =>
    link.exact ? pathname === link.href : pathname === link.href || pathname.startsWith(link.href + "/");

  // Logout korle guest mode e fire jabe
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

  const linkClass = (active: boolean): string =>
    `rounded-full px-4 py-2 text-sm transition-all duration-300 ${
      active
        ? "bg-[#111111] text-[#F3EEE3]"
        : "text-[#333333] hover:bg-[#111111]/5 hover:text-[#D9541E]"
    }`;

  const initial = (user?.name || user?.email || "U").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b border-[#D9D9D9]/70 bg-[#F3EEE3]/80 backdrop-blur-md">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        {/* ---------- Logo ---------- */}
        <Link href="/" className="flex items-center gap-3">
          <span className="h-5 w-5 rounded-full rounded-bl-sm bg-[#D9541E]" />
          <span className="text-xl font-medium tracking-wide text-[#111111]">Gearly</span>
        </Link>

        {/* ---------- Desktop links ---------- */}
        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={linkClass(isActive(link))}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* ---------- Right side ---------- */}
        <div className="flex items-center gap-3">
          {/* Loading state: skeleton */}
          {isPending && (
            <div className="hidden items-center gap-3 lg:flex">
              <div className="h-9 w-16 animate-pulse rounded-full bg-[#D9D9D9]" />
              <div className="h-10 w-24 animate-pulse rounded-full bg-[#D9D9D9]" />
            </div>
          )}

          {/* Guest: Login + Sign Up */}
          {!isPending && !user && (
            <div className="hidden items-center gap-2 lg:flex">
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm text-[#111111] transition-colors hover:text-[#D9541E]"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-[#0B0B0B] px-5 py-2.5 text-sm font-medium text-[#FFFFFF] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#D9541E] hover:shadow-lg"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Logged in: avatar dropdown (Profile + Logout) */}
          {!isPending && user && (
            <div className="relative hidden lg:block" ref={dropRef}>
              <button
                onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-3 rounded-full border border-[#D9D9D9] bg-[#FFFFFF] py-1.5 pl-1.5 pr-4 transition-all duration-300 hover:border-[#D9541E]"
              >
                {user.image ? (
                  // simple img use korechi, jate next.config e domain add korte na hoy
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.image} alt={user.name || "User"} className="h-9 w-9 rounded-full object-cover" />
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

              <div
                className={`absolute right-0 mt-3 w-64 origin-top-right rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF] p-2 shadow-xl transition-all duration-200 ${
                  dropOpen ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
                }`}
              >
                <div className="px-3 py-3">
                  <p className="truncate text-sm text-[#111111]">{user.name}</p>
                  <p className="truncate text-xs text-[#6B6B6B]">{user.email}</p>
                </div>
                <div className="h-px bg-[#D9D9D9]" />
                <Link
                  href={profileHref}
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

          {/* ---------- Mobile hamburger ---------- */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full border border-[#D9D9D9] bg-[#FFFFFF] lg:hidden"
          >
            <span className={`h-0.5 w-5 bg-[#111111] transition-all duration-300 ${mobileOpen ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`h-0.5 w-5 bg-[#111111] transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`h-0.5 w-5 bg-[#111111] transition-all duration-300 ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`} />
          </button>
        </div>
      </nav>

      {/* ---------- Mobile menu (slide down) ---------- */}
      <div
        className={`grid transition-all duration-300 lg:hidden ${
          mobileOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-1 border-t border-[#D9D9D9]/70 px-6 py-5">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className={`block ${linkClass(isActive(link))}`}>
                {link.label}
              </Link>
            ))}

            {isPending && <div className="h-10 animate-pulse rounded-full bg-[#D9D9D9]" />}

            {!isPending && user && (
              <>
                <div className="my-3 h-px bg-[#D9D9D9]" />
                <p className="px-4 text-xs text-[#6B6B6B]">
                  {user.name} · <span className="capitalize text-[#D9541E]">{role}</span>
                </p>
                <Link href={profileHref} className={`block ${linkClass(pathname === profileHref)}`}>
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full rounded-full px-4 py-2 text-left text-sm text-[#333333] hover:text-[#D9541E]"
                >
                  Logout
                </button>
              </>
            )}

            {!isPending && !user && (
              <div className="flex gap-3 pt-3">
                <Link
                  href="/login"
                  className="flex-1 rounded-full border border-[#111111] py-3 text-center text-sm text-[#111111]"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="flex-1 rounded-full bg-[#0B0B0B] py-3 text-center text-sm text-[#FFFFFF] hover:bg-[#D9541E]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}