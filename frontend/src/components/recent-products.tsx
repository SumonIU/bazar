"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

type RecentProduct = {
  id: number;
  name: string;
  image: string | null;
  price: number;
  unit: string;
  status: "in_stock" | "out_of_stock";
  description: string | null;
};

export default function RecentProducts() {
  const [products, setProducts] = useState<RecentProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    apiFetch<RecentProduct[]>("products")
      .then((data) => {
        if (!isMounted) {
          return;
        }
        setProducts((data ?? []).slice(0, 6));
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
            : "Unable to load products.";
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

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (isLoading) {
    return <p className="text-sm text-[var(--muted)]">Loading products...</p>;
  }

  if (products.length === 0) {
    return <p className="text-sm text-[var(--muted)]">No products found.</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {products.map((product) => (
        <article
          key={product.id}
          className="relative rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-5 shadow-[var(--shadow)]"
        >
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-36 w-full rounded-2xl object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-36 w-full items-center justify-center rounded-2xl border border-dashed border-[var(--line)] bg-white text-xs text-[var(--muted)]">
              No image
            </div>
          )}
          <p className="text-xs uppercase tracking-widest text-[var(--muted)]">
            Product
          </p>
          <h3 className="mt-2 text-lg font-semibold">{product.name}</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {product.description ?? "Fresh from nearby sellers"}
          </p>
          <p className="mt-4 text-xs text-[var(--accent-strong)]">
            BDT {product.price} / {product.unit}
          </p>
          <Link
            href={`/product/${product.id}`}
            className="mt-4 inline-flex rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold transition hover:bg-[var(--panel-strong)]"
          >
            View item
          </Link>
        </article>
      ))}
    </div>
  );
}
