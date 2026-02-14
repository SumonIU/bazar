"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import FormField from "@/components/form-field";
import FormStatus from "@/components/form-status";
import { apiFetch } from "@/lib/api";

export default function CustomerSignupPage() {
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

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = {
      fullName: String(form.get("fullName") || "").trim(),
      phone: String(form.get("phone") || "").trim(),
      email: String(form.get("email") || "").trim(),
      password: String(form.get("password") || "").trim(),
    };

    try {
      await apiFetch("auth/customer/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setStatus({
        tone: "success",
        message: "Customer account created. Redirecting...",
      });
      formElement.reset();
      window.setTimeout(() => {
        router.push("/products");
      }, 800);
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Registration failed.";
      setStatus({ tone: "error", message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-6 py-16">
        <div className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-8 shadow-[var(--shadow)]">
          <h1 className="font-serif text-3xl">Customer registration</h1>
          <p className="mt-2 text-[var(--muted)]">
            Create a customer account to browse and order items.
          </p>
          <form
            className="mt-8 grid gap-4 md:grid-cols-2"
            onSubmit={handleSubmit}
          >
            <FormField label="Full name" name="fullName" />
            <FormField label="Phone" name="phone" />
            <FormField label="Email" name="email" type="email" />
            <FormField label="Password" name="password" type="password" />
            <div className="md:col-span-2">
              <FormStatus tone={status?.tone} message={status?.message} />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-70 md:col-span-2"
            >
              {isSubmitting ? "Creating..." : "Create customer account"}
            </button>
          </form>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
