"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { apiFetch } from "@/lib/api";

type SellerRow = {
  id: number;
  userId: number;
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

type AdminStats = {
  sellers: number;
  customers: number;
  products: number;
  reviews: number;
};

type AdminReview = {
  id: number;
  rating: number;
  comment: string | null;
  product?: {
    name: string;
  } | null;
  customer?: {
    fullName: string;
  } | null;
};

const formatCount = (value: number) => value.toLocaleString();

export default function AdminPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoadingSellers, setIsLoadingSellers] = useState(true);
  const [sellersError, setSellersError] = useState<string | null>(null);
  const [deletingSellerId, setDeletingSellerId] = useState<number | null>(null);
  const [sellerActionStatus, setSellerActionStatus] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const [sellers, setSellers] = useState<SellerRow[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [recentReviews, setRecentReviews] = useState<AdminReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

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

  useEffect(() => {
    let isMounted = true;

    if (isCheckingAuth) {
      return () => {
        isMounted = false;
      };
    }

    setIsLoadingSellers(true);
    setSellersError(null);

    apiFetch<SellerRow[]>("sellers")
      .then((data) => {
        if (!isMounted) {
          return;
        }
        setSellers(data);
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }
        const message =
          error && typeof error === "object" && "message" in error
            ? String(error.message)
            : "Unable to load sellers.";
        setSellersError(message);
      })
      .finally(() => {
        if (!isMounted) {
          return;
        }
        setIsLoadingSellers(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isCheckingAuth]);

  const refreshStats = async (isMounted?: () => boolean) => {
    setIsLoadingStats(true);
    setStatsError(null);

    try {
      const data = await apiFetch<AdminStats>("admin/stats");
      if (isMounted && !isMounted()) {
        return;
      }
      setStats({
        sellers: Number(data.sellers ?? 0),
        customers: Number(data.customers ?? 0),
        products: Number(data.products ?? 0),
        reviews: Number(data.reviews ?? 0),
      });
    } catch (error) {
      if (isMounted && !isMounted()) {
        return;
      }
      const message =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Unable to load admin stats.";
      setStatsError(message);
    } finally {
      if (isMounted && !isMounted()) {
        return;
      }
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (isCheckingAuth) {
      return () => {
        isMounted = false;
      };
    }

    const isMountedCheck = () => isMounted;
    refreshStats(isMountedCheck);

    return () => {
      isMounted = false;
    };
  }, [isCheckingAuth]);

  useEffect(() => {
    let isMounted = true;

    if (isCheckingAuth) {
      return () => {
        isMounted = false;
      };
    }

    setIsLoadingReviews(true);
    setReviewsError(null);

    apiFetch<AdminReview[]>("admin/reviews")
      .then((data) => {
        if (!isMounted) {
          return;
        }
        setRecentReviews(data ?? []);
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }
        const message =
          error && typeof error === "object" && "message" in error
            ? String(error.message)
            : "Unable to load recent reviews.";
        setReviewsError(message);
      })
      .finally(() => {
        if (!isMounted) {
          return;
        }
        setIsLoadingReviews(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isCheckingAuth]);

  if (isCheckingAuth) {
    return null;
  }

  const handleDeleteSeller = async (seller: SellerRow) => {
    const confirmDelete = window.confirm(
      `Delete ${seller.shopName}? This removes the seller account and all related data.`,
    );
    if (!confirmDelete) {
      return;
    }

    setSellerActionStatus(null);
    setSellersError(null);
    setDeletingSellerId(seller.id);

    try {
      await apiFetch(`admin/sellers/${seller.id}`, { method: "DELETE" });
      setSellers((prev) => prev.filter((item) => item.id !== seller.id));
      setSellerActionStatus({ tone: "success", message: "Seller deleted." });
      await refreshStats();
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Unable to delete seller.";
      setSellerActionStatus({ tone: "error", message });
    } finally {
      setDeletingSellerId(null);
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
          <AdminCard
            title="Sellers"
            value={isLoadingStats ? "..." : formatCount(stats?.sellers ?? 0)}
          />
          <AdminCard
            title="Customers"
            value={isLoadingStats ? "..." : formatCount(stats?.customers ?? 0)}
          />
          <AdminCard
            title="Products"
            value={isLoadingStats ? "..." : formatCount(stats?.products ?? 0)}
          />
        </div>
        {statsError ? (
          <p className="mt-4 text-sm text-red-600">{statsError}</p>
        ) : null}
        <div className="mt-8 rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
          <h2 className="text-lg font-semibold">Recent reviews</h2>
          {reviewsError ? (
            <p className="mt-4 text-sm text-red-600">{reviewsError}</p>
          ) : null}
          {isLoadingReviews ? (
            <p className="mt-4 text-sm text-[var(--muted)]">
              Loading reviews...
            </p>
          ) : recentReviews.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--muted)]">No reviews yet.</p>
          ) : (
            <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
              {recentReviews.map((review) => (
                <li key={review.id}>
                  {review.product?.name ?? "Product"} by{" "}
                  {review.customer?.fullName ?? "Customer"} - {review.rating}{" "}
                  stars
                  {review.comment ? ` - ${review.comment}` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mt-8 rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--shadow)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Seller list</h2>
            <span className="text-sm text-[var(--muted)]">
              {isLoadingSellers
                ? "Loading sellers..."
                : `${sellers.length} sellers`}
            </span>
          </div>
          {sellersError ? (
            <p className="mt-4 text-sm text-red-600">{sellersError}</p>
          ) : null}
          {sellerActionStatus ? (
            <div className="mt-3">
              <FormStatus
                tone={sellerActionStatus.tone}
                message={sellerActionStatus.message}
              />
            </div>
          ) : null}
          {!isLoadingSellers && !sellersError && sellers.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--muted)]">
              No sellers found.
            </p>
          ) : null}
          {sellers.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] border-separate border-spacing-y-2 text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-widest text-[var(--muted)]">
                    <th className="px-4 py-2">Shop</th>
                    <th className="px-4 py-2">Seller</th>
                    <th className="px-4 py-2">Contact</th>
                    <th className="px-4 py-2">Location</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sellers.map((seller) => (
                    <tr
                      key={seller.id}
                      className="rounded-2xl bg-white shadow-[var(--shadow)]"
                    >
                      <td className="px-4 py-3">
                        <p className="font-semibold">{seller.shopName}</p>
                        <p className="text-xs text-[var(--muted)]">
                          {seller.shopId}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{seller.user.fullName}</p>
                        <p className="text-xs text-[var(--muted)]">
                          ID #{seller.userId}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p>{seller.user.phone ?? "Not provided"}</p>
                        <p className="text-xs text-[var(--muted)]">
                          {seller.user.email ?? "No email"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p>
                          {seller.area}, {seller.district}
                        </p>
                        <p className="text-xs text-[var(--muted)]">
                          {seller.division}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/seller/${seller.id}`}
                            className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold transition hover:bg-[var(--panel)]"
                          >
                            View
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteSeller(seller)}
                            disabled={deletingSellerId === seller.id}
                            className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {deletingSellerId === seller.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
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

function AdminCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--shadow)]">
      <p className="text-sm text-[var(--muted)]">{title}</p>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </div>
  );
}
