"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { apiFetch } from "@/lib/api";

type SellerProfileRow = {
  id: number;
  shopName: string;
  shopId: string;
  division: string;
  district: string;
  area: string;
  user: {
    fullName: string;
    email: string | null;
    phone: string | null;
  };
};

export default function SellersPage() {
  const [sellers, setSellers] = useState<SellerProfileRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    apiFetch<SellerProfileRow[]>("sellers")
      .then((data) => {
        if (!isMounted) {
          return;
        }
        setSellers(data ?? []);
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
            : "Unable to load sellers.";
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
        <h1 className="font-serif text-3xl">Sellers</h1>
        <p className="mt-2 text-[var(--muted)]">
          Browse verified bazars and local sellers.
        </p>
        {error ? <p className="mt-6 text-sm text-red-600">{error}</p> : null}
        {isLoading ? (
          <p className="mt-6 text-sm text-[var(--muted)]">Loading sellers...</p>
        ) : sellers.length === 0 ? (
          <p className="mt-6 text-sm text-[var(--muted)]">No sellers found.</p>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {sellers.map((seller) => (
              <article
                key={seller.id}
                className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]"
              >
                <p className="text-xs uppercase tracking-widest text-[var(--muted)]">
                  Seller
                </p>
                <h2 className="mt-2 text-lg font-semibold">
                  {seller.shopName}
                </h2>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {seller.area}, {seller.district}, {seller.division}
                </p>
                <div className="mt-4 text-sm">
                  <p className="font-medium">{seller.user.fullName}</p>
                  <p className="text-xs text-[var(--muted)]">{seller.shopId}</p>
                </div>
                <Link
                  href={`/seller/${seller.id}`}
                  className="mt-5 inline-flex rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold transition hover:bg-[var(--panel)]"
                >
                  View seller
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
