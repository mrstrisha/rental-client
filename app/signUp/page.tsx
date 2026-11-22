"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth-client";
import { dashboardUrlForRole } from "@/lib/navLinks";


// Form er input gulo ekhane list kora ache, tai bar bar likhte hobe na
const fields = [
  { name: "name", label: "Full name", type: "text" },
  { name: "email", label: "Email address", type: "email" },
  { name: "photo", label: "Photo URL", type: "url" },
  { name: "password", label: "Password", type: "password" },
  { name: "confirm", label: "Confirm password", type: "password" },
];

const handleSubmit = async (
  e: React.FormEvent<HTMLFormElement>,
  router: ReturnType<typeof useRouter>
) => {
  e.preventDefault();

  const formData = new FormData(e.currentTarget);
  const userData = Object.fromEntries(formData.entries());

  console.log(userData);

  const password = String(userData.password);
  const confirm = String(userData.confirm);

  // Password validation
  if (password.length < 6) {
    toast.error("Password must be at least 6 characters");
    return;
  }

  if (!/[A-Z]/.test(password)) {
    toast.error("At least one uppercase letter required");
    return;
  }

  if (!/[a-z]/.test(password)) {
    toast.error("At least one lowercase letter required");
    return;
  }

  if (password !== confirm) {
    toast.error("Password does not match");
    return;
  }

  // Send data to Better Auth
  const result = await authClient.signUp.email({
    name: String(userData.name),
    email: String(userData.email),
    image: String(userData.photo || ""),
    password,
  });

  if (result.error) {
    toast.error("Registration failed. Check console.");
    return;
  }

  // Role Better Auth er authenticated user theke ashe, form theke na.
  const role = result.data.user.role;

  toast.success("Registration successful!");
  startTransition(() => {
    router.push(dashboardUrlForRole(role));
  });
};

// Google diye sign up / login. Notun user hole role automatic "customer" hoy.
const handleGoogle = async () => {
  try {
    const result = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
       // login howar por home page e jabe
    });

    if (result?.error) {
      toast.error(result.error.message || "Google sign up failed");
    }
  } catch {
    toast.error("Google sign up failed");
  }
};

const rules = [
  "Minimum 6 characters",
  "At least one uppercase letter",
  "At least one lowercase letter",
];

// Google er logo
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

// GitHub er logo
function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

export default function SignUpPage() {
  const router = useRouter();

  return (
    // Pura page: cream background, 2 ta column
    <main className="grid min-h-screen bg-[#F3EEE3] text-[#111111] md:grid-cols-2">
      {/* ---------- Left side: black panel ---------- */}
      <section className="relative hidden overflow-hidden bg-[#111111] p-12 text-[#F3EEE3] md:flex md:flex-col md:justify-center">
        {/* Orange circle, animate-pulse diye halka effect */}
        <div className="absolute -right-24 -top-24 h-72 w-72 animate-pulse rounded-full bg-[#D9541E] opacity-40 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 animate-pulse rounded-full bg-[#D9541E] opacity-30 blur-3xl" />

        <div className="relative">
          <h1 className="text-5xl font-light leading-tight">
            A quiet place to keep your work.
          </h1>
          {/* Headline er niche orange line */}
          <div className="mt-4 h-1 w-32 rounded-full bg-[#D9541E]" />
          <p className="mt-6 max-w-sm text-[#F3EEE3]/60">
            Create an account to save your projects and pick up on any device.
          </p>
        </div>
      </section>

      {/* ---------- Right side: form ---------- */}
      <section className="flex items-center justify-center p-6">
        <form onSubmit={(e) => handleSubmit(e, router)} className="w-full max-w-md">
          <h2 className="text-4xl">Create your account</h2>
          <p className="mt-2 text-[#111111]/60">It takes under a minute.</p>

          {/* Input gulo loop kore dekhano hocche */}
          <div className="mt-8 space-y-5">
            {fields.map((field) => (
              <div key={field.name}>
                <label htmlFor={field.name} className="text-sm text-[#111111]/70">
                  {field.label}
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  className="w-full border-b border-[#111111]/30 bg-transparent py-2 outline-none transition-all duration-300 focus:border-[#D9541E] focus:pl-2"
                />
              </div>
            ))}
          </div>

          {/* Password rules box */}
          <ul className="mt-6 space-y-2 rounded-xl bg-[#111111]/5 p-4 text-sm">
            {rules.map((rule) => (
              <li key={rule} className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full border border-[#D9541E]" />
                {rule}
              </li>
            ))}
          </ul>

          {/* Button: hover korle orange hobe ar ektu upore uthbe */}
          <button
            type="submit"
            className="mt-6 w-full rounded-full bg-[#111111] py-4 font-medium text-[#F3EEE3] transition-all duration-300 hover:-translate-y-1 hover:bg-[#D9541E] hover:shadow-lg"
          >
            Create Account
          </button>

          {/* ---------- Google ar GitHub ---------- */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#111111]/15" />
            <span className="text-xs text-[#111111]/50">or continue with</span>
            <div className="h-px flex-1 bg-[#111111]/15" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Google: kaj kore */}
            <button
              type="button"
              onClick={handleGoogle}
              className="flex items-center justify-center gap-3 rounded-full border border-[#111111]/20 bg-white py-3 text-sm font-medium text-[#111111] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D9541E] hover:shadow-md"
            >
              <GoogleIcon />
              Google
            </button>

            {/* GitHub: shudhu dekhano, kono functionality nai */}
            <button
              type="button"
              className="flex items-center justify-center gap-3 rounded-full border border-[#111111]/20 bg-white py-3 text-sm font-medium text-[#111111] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D9541E] hover:shadow-md"
            >
              <GithubIcon />
              GitHub
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-[#111111]/60">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-[#D9541E] hover:underline">
              Login
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}