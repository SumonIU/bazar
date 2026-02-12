"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import FormField from "@/components/form-field";
import FormStatus from "@/components/form-status";
import { apiFetch } from "@/lib/api";

export default function AdminPage() {
  const router = useRouter();
  const [status, setStatus] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;

    apiFetch<{ user: { role: string } }>("auth/me")
      .then(({ user }) => {
        if (!isMounted) {
          return;
        }
        if (user.role !== "admin") {
          router.replace("/login");
          return;
        }
        setIsCheckingAuth(false);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }
        router.replace("/login");
      });

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (isCheckingAuth) {
    return null;
  }

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
      setStatus({ tone: "success", message: "Seller account created." });
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
      <main className="mx-auto w-full max-w-6xl px-6 py-16">
        <h1 className="font-serif text-3xl">Admin control</h1>
        <p className="mt-2 text-[var(--muted)]">
          Monitor sellers, customers, products, and reviews.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <AdminCard title="Sellers" value="340" />
          <AdminCard title="Customers" value="5,200" />
          <AdminCard title="Flagged listings" value="12" />
        </div>
        <div className="mt-8 rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
          <h2 className="text-lg font-semibold">Recent reviews</h2>
          <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
            <li>FreshFish by Rahman - 5 stars - Great delivery speed.</li>
            <li>GreenHarvest - 4 stars - Good quality.</li>
          </ul>
        </div>
        <div className="mt-8 rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--shadow)]">
          <h2 className="text-lg font-semibold">Create seller account</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Admin-only creation for new sellers. This should call the admin API
            endpoint when wired.
          </p>
          <form
            className="mt-6 grid gap-4 md:grid-cols-2"
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
              {isSubmitting ? "Creating..." : "Create seller"}
            </button>
          </form>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function AdminCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--shadow)]">
      <p className="text-sm text-[var(--muted)]">{title}</p>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </div>
  );
}
