"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import FormField from "@/components/form-field";
import FormStatus from "@/components/form-status";
import { apiFetch } from "@/lib/api";

type CartItem = {
  id: number;
  productId: number;
  quantity: number;
  product?: {
    id: number;
    name: string;
    price: number;
    unit: string;
  } | null;
};

export default function CartPage() {
  const router = useRouter();
  const [status, setStatus] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [removingItemId, setRemovingItemId] = useState<number | null>(null);

  const total = items.reduce((sum, item) => {
    const price = Number(item.product?.price ?? 0);
    return sum + price * item.quantity;
  }, 0);

  useEffect(() => {
    let isMounted = true;

    setIsLoadingItems(true);
    setItemsError(null);

    apiFetch<CartItem[]>("cart")
      .then((data) => {
        if (!isMounted) {
          return;
        }
        setItems(data ?? []);
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }
        const message =
          error && typeof error === "object" && "message" in error
            ? String(error.message)
            : "Unable to load cart items.";
        setItemsError(message);
      })
      .finally(() => {
        if (!isMounted) {
          return;
        }
        setIsLoadingItems(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    const formElement = event.currentTarget;

    if (items.length === 0) {
      setStatus({ tone: "error", message: "Your cart is empty." });
      setIsSubmitting(false);
      return;
    }

    const form = new FormData(formElement);
    const payload = {
      deliveryAddress: String(form.get("address") || "").trim(),
      phone: String(form.get("phone") || "").trim(),
      paymentMethod: String(form.get("payment") || "").trim(),
      items: items
        .filter((item) => item.product)
        .map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: Number(item.product?.price ?? 0),
        })),
    };

    try {
      await apiFetch("orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      await Promise.all(
        items.map((item) =>
          apiFetch(`cart/${item.id}`, {
            method: "DELETE",
          }),
        ),
      );
      setStatus({ tone: "success", message: "Order placed." });
      setItems([]);
      formElement.reset();
      window.setTimeout(() => {
        router.push("/order/history");
      }, 600);
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

  const handleRemoveItem = async (itemId: number) => {
    setRemovingItemId(itemId);
    setItemsError(null);

    try {
      await apiFetch(`cart/${itemId}`, {
        method: "DELETE",
      });
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Unable to remove item.";
      setItemsError(message);
    } finally {
      setRemovingItemId(null);
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
            {itemsError ? (
              <p className="mt-4 text-sm text-red-600">{itemsError}</p>
            ) : null}
            {isLoadingItems ? (
              <p className="mt-4 text-sm text-[var(--muted)]">
                Loading items...
              </p>
            ) : items.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--muted)]">
                Your cart is empty.
              </p>
            ) : (
              <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between"
                  >
                    <span>
                      {item.product?.name ?? "Product"} x{item.quantity} - BDT{" "}
                      {item.product?.price ?? 0}
                      {item.product?.unit ? `/${item.product.unit}` : ""}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={removingItemId === item.id}
                      className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-semibold text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {removingItemId === item.id ? "Removing..." : "Remove"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--shadow)]">
            <h2 className="text-lg font-semibold">Checkout</h2>
            <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
              <FormField label="Delivery address" name="address" />
              <FormField label="Phone number" name="phone" />
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
              <p className="text-sm text-[var(--muted)]">
                Total: BDT {total.toFixed(2)}
              </p>
              <button
                type="submit"
                disabled={isSubmitting || isLoadingItems}
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
