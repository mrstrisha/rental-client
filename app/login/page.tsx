
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { startTransition, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { dashboardUrlForRole } from "@/lib/navLinks";

const fields = [
  {
    name: "email",
    label: "Email address",
    type: "email",
    hint: "you@example.com",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    hint: "••••••••",
  },
];

const handleLogin = async (
  e: FormEvent<HTMLFormElement>,
  router: ReturnType<typeof useRouter>
) => {
  e.preventDefault();

  const formData = new FormData(e.currentTarget);
  const userData = Object.fromEntries(formData.entries());

  try {
    // Step 1: Better Auth sign-in
    const result = await authClient.signIn.email({
      email: String(userData.email),
      password: String(userData.password),
    });

    if (result.error) {
      toast.error(result.error.message || "Login failed");
      return;
    }

    // Step 2: JWT token ana (existing behavior)
    const tokenRes = await fetch("/api/auth/token");
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      toast.error("Could not get JWT token");
      return;
    }

    // Step 3: Token check
    console.log("JWT Token:", tokenData.token);

    // Role Better Auth er authenticated user theke ashe, form theke na.
    const role = result.data.user.role;

    // View Details e login-e pathano hoy; login successful-e oi page-e feriye name.
    const requested = new URLSearchParams(window.location.search).get("redirect");
    const redirectTarget =
      requested && requested.startsWith("/") && !requested.startsWith("//")
        ? requested
        : dashboardUrlForRole(role);

    toast.success("Login successful!");
    startTransition(() => {
      router.push(redirectTarget);
    });
  } catch (error) {
    console.log(error);
    toast.error("Something went wrong!");
  }
};

export default function LoginPage() {
  const router = useRouter();

  return (
    <main className="grid min-h-screen bg-[#F3EEE3] md:grid-cols-2">

      {/* Left side: form */}
      <section className="flex items-center justify-center p-6 md:p-12">
        <form
          onSubmit={(e) => handleLogin(e, router)}
          className="w-full max-w-sm"
        >
          {/* Brand */}
          <div className="mb-12 flex items-center gap-3">
            <span className="h-5 w-5 rounded-full bg-[#D9541E]" />
            <span className="text-xl tracking-wide text-[#111111]">
              Atelier
            </span>
          </div>

          <h1 className="text-5xl font-light text-[#111111]">
            Welcome back.
          </h1>

          <div className="mt-4 h-1 w-20 rounded-full bg-[#D9541E]" />

          <p className="mt-4 text-[#6B6B6B]">
            Log in to continue where you left off.
          </p>

          {/* Input fields */}
          <div className="mt-10 space-y-5">
            {fields.map((field) => (
              <div key={field.name}>
                <label
                  htmlFor={field.name}
                  className="mb-1 block text-sm text-[#333333]"
                >
                  {field.label}
                </label>

                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  placeholder={field.hint}
                  required
                  className="w-full rounded-xl border border-[#D9D9D9] bg-[#FFFFFF] px-4 py-3 text-[#111111] outline-none transition-all duration-300 placeholder:text-[#6B6B6B]/60 focus:border-[#D9541E] focus:ring-4 focus:ring-[#D9541E]/15"
                />
              </div>
            ))}
          </div>

          {/* Forgot password */}
          <div className="mt-3 text-right">
            <Link
              href="/forgot"
              className="text-sm text-[#6B6B6B] transition-colors hover:text-[#D9541E]"
            >
              Forgot password?
            </Link>
          </div>

          {/* Login button */}
          <button
            type="submit"
            className="mt-6 w-full rounded-full bg-[#0B0B0B] py-4 font-medium text-[#FFFFFF] transition-all duration-300 hover:-translate-y-1 hover:bg-[#D9541E] hover:shadow-lg"
          >
            Log in
          </button>

          <p className="mt-6 text-center text-sm text-[#6B6B6B]">
            Don&apos;t have an account?{" "}
            <Link
              href="/signUp"
              className="font-medium text-[#D9541E] hover:underline"
            >
              Sign up
            </Link>
          </p>
        </form>
      </section>

      {/* Right side: dark panel */}
      <section className="group relative hidden overflow-hidden bg-[#0B0B0B] md:block">

        <div className="absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-[#D9541E] transition-all duration-700 group-hover:-bottom-32 group-hover:-right-32" />

        <div className="absolute -bottom-64 -right-64 h-[40rem] w-[40rem] rounded-full border border-[#333333]" />

        <div className="absolute -bottom-80 -right-80 h-[52rem] w-[52rem] rounded-full border border-[#1A1A1A]" />

        <div className="absolute left-14 top-16 space-y-3">
          <div className="h-9 w-64 rounded-full bg-[#1A1A1A] transition-all duration-500 group-hover:translate-x-6" />
          <div className="h-9 w-52 rounded-full bg-[#333333] transition-all delay-75 duration-500 group-hover:translate-x-10" />
          <div className="h-9 w-40 rounded-full bg-[#6B6B6B] transition-all delay-100 duration-500 group-hover:translate-x-14" />
          <div className="h-9 w-28 rounded-full bg-[#D9D9D9] transition-all delay-150 duration-500 group-hover:translate-x-20" />
        </div>

        <div className="absolute left-14 top-1/2 max-w-xs -translate-y-1/2 pt-16">
          <p className="text-3xl font-light leading-snug text-[#F3EEE3]">
            Good work deserves a good place to live.
          </p>
          <div className="mt-4 h-px w-16 bg-[#D9541E]" />
        </div>

      </section>
    </main>
  );
}
