"use client";

import { useState } from "react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import FormField from "@/components/form-field";
import FormStatus from "@/components/form-status";
import { apiFetch } from "@/lib/api";

export default function CartPage() {
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
      deliveryAddress: String(form.get("address") || "").trim(),
      phone: String(form.get("phone") || "").trim(),
      paymentMethod: String(form.get("payment") || "").trim(),
      items: [
        {
          productId: Number(form.get("productId")),
          quantity: Number(form.get("quantity")),
          unitPrice: Number(form.get("unitPrice")),
        },
      ],
    };

    try {
      await apiFetch("orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setStatus({ tone: "success", message: "Order placed." });
      event.currentTarget.reset();
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Order failed.";
      setStatus({ tone: "error", message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <h1 className="font-serif text-3xl">Your cart</h1>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
            <h2 className="text-lg font-semibold">Items</h2>
            <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
              <li>Hilsa 1.2kg x1 - BDT 1200</li>
              <li>Deshi Tomato x2 - BDT 160</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--shadow)]">
            <h2 className="text-lg font-semibold">Checkout</h2>
            <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
              <FormField label="Delivery address" name="address" />
              <FormField label="Phone number" name="phone" />
              <FormField label="Product ID" name="productId" type="number" />
              <FormField label="Quantity" name="quantity" type="number" />
              <FormField label="Unit price" name="unitPrice" type="number" />
              <div>
                <p className="text-sm font-medium">Payment method</p>
                <div className="mt-2 grid gap-2 text-xs text-[var(--muted)]">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="payment"
                      value="bKash"
                      defaultChecked
                    />
                    bKash
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="payment" value="Nagad" /> Nagad
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="payment" value="Rocket" /> Rocket
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="payment" value="Card" /> Card
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="payment" value="COD" /> Cash on
                    delivery
                  </label>
                </div>
              </div>
              <FormStatus tone={status?.tone} message={status?.message} />
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Placing..." : "Place order"}
              </button>
            </form>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
