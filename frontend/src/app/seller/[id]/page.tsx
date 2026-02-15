"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { apiFetch } from "@/lib/api";

type SellerDetail = {
  seller: {
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
  stats: {
    products: number;
    orders: number;
    rating: number;
    reviews: number;
  };
  recentReviews: Array<{
    id: number;
    rating: number;
    comment: string | null;
    customer?: {
      fullName: string;
    } | null;
  }>;
};

type SellerProduct = {
  id: number;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  status: "in_stock" | "out_of_stock";
  image?: string | null;
};

const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8," +
  "<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'>" +
  "<rect width='100%' height='100%' fill='%23f2eee8'/>" +
  "<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'" +
  " fill='%23999898' font-size='10' font-family='Arial'>No image</text>" +
  "</svg>";

export default function SellerPage() {
  const params = useParams();
  const sellerId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [seller, setSeller] = useState<SellerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRoleResolved, setIsRoleResolved] = useState(false);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    let isMounted = true;

    apiFetch<{ user: { role: string } }>("auth/me")
      .then(({ user }) => {
        if (!isMounted) {
          return;
        }
        setIsAdmin(user.role === "admin");
        setIsRoleResolved(true);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }
        setIsAdmin(false);
        setIsRoleResolved(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (!sellerId) {
      setError("Seller not found.");
      setIsLoading(false);
      setIsLoadingProducts(false);
      return () => {
        isMounted = false;
      };
    }

    setIsLoading(true);
    setError(null);

    apiFetch<SellerDetail>(`sellers/${sellerId}`)
      .then((data) => {
        if (!isMounted) {
          return;
        }
        setSeller(data);
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
            : "Unable to load seller details.";
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
  }, [sellerId]);

  useEffect(() => {
    let isMounted = true;

    if (!sellerId || !isRoleResolved) {
      return () => {
        isMounted = false;
      };
    }

    setIsLoadingProducts(true);
    setProductsError(null);

    const endpoint = isAdmin
      ? `admin/sellers/${sellerId}/products`
      : `sellers/${sellerId}/products`;

    apiFetch<SellerProduct[]>(endpoint)
      .then((data) => {
        if (!isMounted) {
          return;
        }
        setProducts(data ?? []);
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
        setProductsError(message);
      })
      .finally(() => {
        if (!isMounted) {
          return;
        }
        setIsLoadingProducts(false);
      });

    return () => {
      isMounted = false;
    };
  }, [sellerId, isAdmin, isRoleResolved]);

  const handleDeleteProduct = async (productId: number) => {
    if (!window.confirm("Delete this product?")) {
      return;
    }

    setDeletingProductId(productId);
    setProductsError(null);

    try {
      await apiFetch(`admin/products/${productId}`, {
        method: "DELETE",
      });
      setProducts((prev) => prev.filter((product) => product.id !== productId));
    } catch (deleteError) {
      const message =
        deleteError &&
        typeof deleteError === "object" &&
        "message" in deleteError
          ? String(deleteError.message)
          : "Product deletion failed.";
      setProductsError(message);
    } finally {
      setDeletingProductId(null);
    }
  };

  const shopName = seller?.seller.shopName ?? "Seller";
  const location = seller
    ? `${seller.seller.area}, ${seller.seller.district} | ${seller.seller.division}`
    : "Location not provided.";
  const ratingText = seller
    ? `Rating ${seller.stats.rating.toFixed(1)} (${seller.stats.reviews} reviews)`
    : "";

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--shadow)]">
          <h1 className="font-serif text-3xl">
            {isLoading ? "Loading..." : shopName}
          </h1>
          {error ? (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          ) : (
            <p className="mt-2 text-[var(--muted)]">
              {location}
              {ratingText ? ` | ${ratingText}` : ""}
            </p>
          )}
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <SellerStat
              label="Orders delivered"
              value={isLoading ? "..." : String(seller?.stats.orders ?? 0)}
            />
            <SellerStat
              label="Products"
              value={isLoading ? "..." : String(seller?.stats.products ?? 0)}
            />
            <SellerStat
              label="Average rating"
              value={isLoading ? "..." : (seller?.stats.rating ?? 0).toFixed(1)}
            />
          </div>
        </div>
        <div className="mt-10 rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
          <h2 className="text-lg font-semibold">Latest reviews</h2>
          {isLoading ? (
            <p className="mt-4 text-sm text-[var(--muted)]">
              Loading reviews...
            </p>
          ) : seller?.recentReviews?.length ? (
            <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
              {seller.recentReviews.map((review) => (
                <li key={review.id}>
                  {review.rating} stars -
                  {review.comment ? ` ${review.comment}` : " No comment"} -
                  {review.customer?.fullName ?? "Customer"}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-[var(--muted)]">No reviews yet.</p>
          )}
        </div>
        <div className="mt-10 rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--shadow)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Seller products</h2>
            <span className="text-sm text-[var(--muted)]">
              {isLoadingProducts
                ? "Loading products..."
                : `${products.length} products`}
            </span>
          </div>
          {productsError ? (
            <p className="mt-4 text-sm text-red-600">{productsError}</p>
          ) : null}
          {!isLoadingProducts && !productsError && products.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--muted)]">No products yet.</p>
          ) : null}
          {products.length > 0 && !isAdmin ? (
            <div className="mt-4 grid gap-6 md:grid-cols-3">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="rounded-3xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow)]"
                >
                  <img
                    src={product.image || FALLBACK_IMAGE}
                    alt={product.name}
                    onError={(event) => {
                      event.currentTarget.src = FALLBACK_IMAGE;
                    }}
                    className="h-36 w-full rounded-2xl border border-[var(--line)] object-cover"
                  />
                  <h3 className="mt-3 text-lg font-semibold">{product.name}</h3>
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    Available: {product.quantity} {product.unit}
                  </p>
                  <p className="mt-4 text-sm font-semibold text-[var(--accent-strong)]">
                    BDT {product.price} / {product.unit}
                  </p>
                </article>
              ))}
            </div>
          ) : null}
          {products.length > 0 && isAdmin ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] border-separate border-spacing-y-2 text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-widest text-[var(--muted)]">
                    <th className="px-4 py-2">Product</th>
                    <th className="px-4 py-2">Price</th>
                    <th className="px-4 py-2">Quantity</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="rounded-2xl bg-white shadow-[var(--shadow)]"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {product.image ? (
                            <img
                              src={product.image || FALLBACK_IMAGE}
                              alt={product.name}
                              onError={(event) => {
                                event.currentTarget.src = FALLBACK_IMAGE;
                              }}
                              className="h-10 w-10 rounded-lg border border-[var(--line)] object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--line)] text-xs text-[var(--muted)]">
                              No image
                            </div>
                          )}
                          <div>
                            <p className="font-semibold">{product.name}</p>
                            <p className="text-xs text-[var(--muted)]">
                              ID #{product.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        BDT {product.price} / {product.unit}
                      </td>
                      <td className="px-4 py-3">{product.quantity}</td>
                      <td className="px-4 py-3">
                        {product.status === "in_stock"
                          ? "In stock"
                          : "Out of stock"}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={deletingProductId === product.id}
                          className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingProductId === product.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function SellerStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
      <p className="text-xs uppercase tracking-widest text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}
