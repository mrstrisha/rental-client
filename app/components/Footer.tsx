"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { dashboardUrlForRole } from "@/lib/navLinks";
import { CATEGORIES } from "@/lib/types";

const linkClass =
  "text-sm text-[#F3EEE3]/60 transition-colors hover:text-[#D9541E]";

export default function Footer() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const dashboardUrl = user
    ? dashboardUrlForRole((user as { role?: string } | undefined)?.role)
    : "/login";

  return (
    <footer className="mt-auto bg-[#111111] text-[#F3EEE3]">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-3">
              <span className="h-5 w-5 rounded-full rounded-bl-sm bg-[#D9541E]" />
              <span className="text-xl font-medium tracking-wide">Gearly</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#F3EEE3]/60">
              A premium equipment rental marketplace for trusted owners and
              people who need the right gear, right on time.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-[#F3EEE3]">
              Explore
            </h2>
            <ul className="mt-5 space-y-3">
              <li>
                <Link href="/" className={linkClass}>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/equipment" className={linkClass}>
                  Browse Collection
                </Link>
              </li>
              <li>
                <Link href={dashboardUrl} className={linkClass}>
                  My Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-[#F3EEE3]">
              Account
            </h2>
            <ul className="mt-5 space-y-3">
              {user ? (
                <li>
                  <Link href={dashboardUrl} className={linkClass}>
                    My Dashboard
                  </Link>
                </li>
              ) : (
                <>
                  <li>
                    <Link href="/login" className={linkClass}>
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link href="/signUp" className={linkClass}>
                      Create Account
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-[#F3EEE3]">
              Categories
            </h2>
            <ul className="mt-5 space-y-3">
              {CATEGORIES.slice(0, 4).map((category) => (
                <li key={category} className={linkClass}>
                  {category}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[#F3EEE3]/10 pt-6 text-xs text-[#F3EEE3]/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Gearly. All rights reserved.</p>
          <p>Built for reliable equipment rental.</p>
        </div>
      </div>
    </footer>
  );
}
