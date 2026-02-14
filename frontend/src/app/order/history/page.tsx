"use client";

import { useEffect, useState } from "react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { apiFetch } from "@/lib/api";

type OrderItem = {
  id: number;
  quantity: number;
  unitPrice: number;
};

type Order = {
  id: number;
  status: "pending" | "in_delivery" | "completed" | "cancelled";
  total: number;
  createdAt: string;
  items?: OrderItem[];
};

const formatStatus = (status: Order["status"]) =>
  status.replace(/_/g, " ").replace(/^\w/, (match) => match.toUpperCase());

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    setError(null);

    apiFetch<Order[]>("orders")
      .then((data) => {
        if (!isMounted) {
          return;
        }
        setOrders(data ?? []);
      })
      .catch((fetchError) => {
        if (!isMounted) {
          return;
        }
        const message =
          fetchError &&
          typeof fetchError === "object" &&
          "message" in fetchError
            ? String(fetchError.message)
            : "Unable to load orders.";
        setError(message);
      })
      .finally(() => {
        if (!isMounted) {
          return;
        }
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <h1 className="font-serif text-3xl">Order history</h1>
        <div className="mt-6 rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {isLoading ? (
            <p className="text-sm text-[var(--muted)]">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No orders yet.</p>
          ) : (
            <ul className="space-y-3 text-sm text-[var(--muted)]">
              {orders.map((order) => (
                <li key={order.id}>
                  Order #{order.id} - {formatStatus(order.status)} - BDT{" "}
                  {Number(order.total).toFixed(2)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
