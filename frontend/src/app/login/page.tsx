"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import FormField from "@/components/form-field";
import FormStatus from "@/components/form-status";
import { apiFetch } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [status, setStatus] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    const identifier = String(form.get("identifier") || "").trim();
    const password = String(form.get("password") || "").trim();
    const payload = identifier.includes("@")
      ? { email: identifier, password }
      : { phone: identifier, password };

    try {
      const result = await apiFetch<{ user: { role: string } }>("auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const role = result.user.role;
      const destination =
        role === "admin"
          ? "/admin"
          : role === "seller"
            ? "/dashboard/seller"
            : "/";
      router.push(destination);
      setStatus({ tone: "success", message: "Logged in successfully." });
      event.currentTarget.reset();
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Login failed.";
      setStatus({ tone: "error", message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <div className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-8 shadow-[var(--shadow)]">
          <h1 className="font-serif text-3xl">Welcome back</h1>
          <p className="mt-2 text-[var(--muted)]">
            Sign in with email + password or phone + password.
          </p>
          <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
            <FormField
              label="Email or Phone"
              name="identifier"
              placeholder="you@email.com or 01XXXXXXXXX"
            />
            <FormField label="Password" name="password" type="password" />
            <FormStatus tone={status?.tone} message={status?.message} />
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>
          <p className="mt-6 text-sm text-[var(--muted)]">
            New to Bazar.com?{" "}
            <Link href="/signup/customer" className="text-[var(--accent)]">
              Create a customer account
            </Link>
            .
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
