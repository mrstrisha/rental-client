"use client";

import Link from "next/link";
import { toast } from "react-toastify";

// Form er input gulo ekhane list kora ache, tai bar bar likhte hobe na
const fields = [
  { name: "name", label: "Full name", type: "text" },
  { name: "email", label: "Email address", type: "email" },
  { name: "photo", label: "Photo URL", type: "url" },
  { name: "password", label: "Password", type: "password" },
  { name: "confirm", label: "Confirm password", type: "password" },
];

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
  const res = await fetch("/api/auth/sign-up/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: userData.name,
      email: userData.email,
      image: userData.photo,
      password: password,
    }),
  });

const responseText = await res.text();

console.log("Server Status:", res.status);
console.log("Server Response:", responseText);

if (!res.ok) {
  toast.error("Registration failed. Check console.");
  return;
}

const data = JSON.parse(responseText);

console.log(data);
toast.success("Registration successful!");
};
const rules = [
  "Minimum 6 characters",
  "At least one uppercase letter",
  "At least one lowercase letter",
];

export default function SignUpPage() {
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
        <form onSubmit={handleSubmit} className="w-full max-w-md">
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

          <p className="mt-5 text-center text-sm text-[#111111]/60">
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