"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { apiFetch } from "@/lib/api";

const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8," +
  "<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'>" +
  "<rect width='100%' height='100%' fill='%23f2eee8'/>" +
  "<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'" +
  " fill='%23999898' font-size='12' font-family='Arial'>No image</text>" +
  "</svg>";

type ProductListItem = {
  id: number;
  name: string;
  price: number;
  unit: string;
  image?: string | null;
  seller?: {
    id: number;
    fullName: string;
  } | null;
};

type ProductListItemApi = ProductListItem & {
  images?: string | null;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    setError(null);

    apiFetch<ProductListItemApi[]>("products")
      .then((data) => {
        if (!isMounted) {
          return;
        }
        const normalized = (data ?? []).map((item) => ({
          ...item,
          image: item.image ?? item.images ?? null,
        }));
        setProducts(normalized);
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

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl">Products</h1>
            <p className="mt-2 text-[var(--muted)]">
              Browse the latest listings from local sellers.
            </p>
          </div>
          <span className="text-sm text-[var(--muted)]">
            {isLoading ? "Loading products..." : `${products.length} products`}
          </span>
        </div>
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        {isLoading ? (
          <p className="mt-6 text-sm text-[var(--muted)]">
            Loading products...
          </p>
        ) : products.length === 0 ? (
          <p className="mt-6 text-sm text-[var(--muted)]">No products yet.</p>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="rounded-3xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow)]"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={product.image || FALLBACK_IMAGE}
                    alt={product.name}
                    onError={(event) => {
                      event.currentTarget.src = FALLBACK_IMAGE;
                    }}
                    className="h-16 w-16 rounded-2xl border border-[var(--line)] object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {product.seller?.fullName ?? "Seller"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm font-semibold text-[var(--accent-strong)]">
                    BDT {product.price} / {product.unit}
                  </p>
                  <Link
                    href={`/product/${product.id}`}
                    className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold"
                  >
                    View item
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
