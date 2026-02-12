"use client";

import { useState } from "react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import FormField from "@/components/form-field";
import FormStatus from "@/components/form-status";
import { apiFetch } from "@/lib/api";

export default function SellerDashboardPage() {
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
    const imagesRaw = String(form.get("images") || "").trim();
    const payload = {
      name: String(form.get("name") || "").trim(),
      nutritionInfo: String(form.get("nutritionInfo") || "").trim() || null,
      images: imagesRaw
        ? imagesRaw
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
      price: Number(form.get("price")),
      unit: String(form.get("unit") || "").trim(),
      quantity: Number(form.get("quantity")),
      description: String(form.get("description") || "").trim() || null,
    };

    try {
      await apiFetch("products", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setStatus({ tone: "success", message: "Product created." });
      event.currentTarget.reset();
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Product creation failed.";
      setStatus({ tone: "error", message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-6">
          <h1 className="font-serif text-3xl">Seller dashboard</h1>
          <div className="grid gap-6 md:grid-cols-3">
            <DashboardCard title="Active listings" value="28" />
            <DashboardCard title="Orders today" value="12" />
            <DashboardCard title="Rating" value="4.8" />
          </div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--shadow)]">
            <h2 className="text-lg font-semibold">Quick actions</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <ActionButton label="Post new item" />
              <ActionButton label="Update inventory" />
              <ActionButton label="View reviews" />
            </div>
          </div>
          <div className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
            <h2 className="text-lg font-semibold">Recent items</h2>
            <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
              <li>Hilsa 1.2kg - BDT 1200 - In stock</li>
              <li>Deshi Tomato - BDT 80/kg - Low stock</li>
              <li>Organic Honey - BDT 950 - Out of stock</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--shadow)]">
            <h2 className="text-lg font-semibold">Create product</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Sellers can add new listings here.
            </p>
            <form
              className="mt-6 grid gap-4 md:grid-cols-2"
              onSubmit={handleSubmit}
            >
              <FormField label="Item name" name="name" />
              <FormField label="Unit" name="unit" placeholder="kg, pcs" />
              <FormField label="Price" name="price" type="number" />
              <FormField label="Quantity" name="quantity" type="number" />
              <FormField
                label="Nutrition info"
                name="nutritionInfo"
                placeholder="Optional"
              />
              <FormField
                label="Images (comma separated URLs)"
                name="images"
                placeholder="https://..."
              />
              <FormField
                label="Description"
                name="description"
                placeholder="Optional"
              />
              <div className="md:col-span-2">
                <FormStatus tone={status?.tone} message={status?.message} />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-70 md:col-span-2"
              >
                {isSubmitting ? "Creating..." : "Create product"}
              </button>
            </form>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function DashboardCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--shadow)]">
      <p className="text-sm text-[var(--muted)]">{title}</p>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function ActionButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm font-medium"
    >
      {label}
    </button>
  );
}
