"use client";

import { useState } from "react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import FormField from "@/components/form-field";
import FormStatus from "@/components/form-status";
import { apiFetch } from "@/lib/api";

export default function SellerSignupPage() {
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
    const payload = {
      fullName: String(form.get("fullName") || "").trim(),
      shopName: String(form.get("shopName") || "").trim(),
      division: String(form.get("division") || "").trim(),
      district: String(form.get("district") || "").trim(),
      area: String(form.get("area") || "").trim(),
      phone: String(form.get("phone") || "").trim(),
      email: String(form.get("email") || "").trim(),
      password: String(form.get("password") || "").trim(),
    };

    try {
      await apiFetch("admin/sellers", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setStatus({
        tone: "success",
        message: "Seller account created by admin.",
      });
      event.currentTarget.reset();
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Seller creation failed.";
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
          <h1 className="font-serif text-3xl">Seller registration</h1>
          <p className="mt-2 text-[var(--muted)]">
            Admin-only creation for seller accounts.
          </p>
          <form
            className="mt-8 grid gap-4 md:grid-cols-2"
            onSubmit={handleSubmit}
          >
            <FormField label="Full name" name="fullName" />
            <FormField label="Shop/Bazar name" name="shopName" />
            <FormField label="Division" name="division" />
            <FormField label="District" name="district" />
            <FormField label="Area" name="area" />
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
              {isSubmitting ? "Creating..." : "Create seller account"}
            </button>
          </form>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
