"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import SearchPanel from "@/components/search-panel";
import { apiFetch } from "@/lib/api";

type SearchProduct = {
  id: number;
  name: string;
  price: number;
  unit: string;
  seller?: {
    fullName: string;
    sellerProfile?: {
      shopName: string;
    } | null;
  } | null;
};

type FilterParams = {
  maxPrice?: number;
  posted?: "today";
};

const parseFilterText = (value: string): FilterParams => {
  const lowered = value.toLowerCase();
  const numberMatch = lowered.match(/(\d+(?:\.\d+)?)/);
  const maxPrice = numberMatch ? Number(numberMatch[1]) : undefined;
  const posted = lowered.includes("today") ? "today" : undefined;

  return {
    maxPrice: maxPrice && maxPrice > 0 ? maxPrice : undefined,
    posted,
  };
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const filterParams = useMemo(() => parseFilterText(filter), [filter]);

  const fetchProducts = async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams();
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      params.set("query", trimmedQuery);
    }
    if (filterParams.maxPrice) {
      params.set("maxPrice", String(filterParams.maxPrice));
    }
    if (filterParams.posted) {
      params.set("posted", filterParams.posted);
    }

    const path = params.toString()
      ? `products?${params.toString()}`
      : "products";

    try {
      const data = await apiFetch<SearchProduct[]>(path);
      if (requestIdRef.current !== requestId) {
        return;
      }
      setResults(data ?? []);
    } catch (fetchError) {
      if (requestIdRef.current !== requestId) {
        return;
      }
      const message =
        fetchError && typeof fetchError === "object" && "message" in fetchError
          ? String(fetchError.message)
          : "Unable to load products.";
      setError(message);
    } finally {
      if (requestIdRef.current !== requestId) {
        return;
      }
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchProducts();
  };

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 py-16">
        <h1 className="font-serif text-3xl">Search products</h1>
        <p className="mt-2 text-[var(--muted)]">
          Filter by division, district, bazar name, seller name, or item name.
        </p>
        <div className="mt-8">
          <SearchPanel
            query={query}
            filter={filter}
            onQueryChange={setQuery}
            onFilterChange={setFilter}
            onSearch={handleSearch}
            isSearching={isLoading}
          />
        </div>
        {error ? <p className="mt-6 text-sm text-red-600">{error}</p> : null}
        {isLoading ? (
          <p className="mt-6 text-sm text-[var(--muted)]">Loading results...</p>
        ) : results.length === 0 ? (
          <p className="mt-6 text-sm text-[var(--muted)]">No results found.</p>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {results.map((product) => (
              <ResultCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function ResultCard({ product }: { product: SearchProduct }) {
  const sellerName =
    product.seller?.sellerProfile?.shopName ??
    product.seller?.fullName ??
    "Seller";

  return (
    <article className="rounded-3xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow)]">
      <h3 className="text-lg font-semibold">{product.name}</h3>
      <p className="mt-2 text-sm text-[var(--muted)]">{sellerName}</p>
      <p className="mt-3 text-sm font-semibold">
        BDT {product.price} / {product.unit}
      </p>
      <Link
        href={`/product/${product.id}`}
        className="mt-4 inline-flex rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-black"
      >
        View item
      </Link>
    </article>
  );
}
