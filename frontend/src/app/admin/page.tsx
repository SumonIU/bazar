"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import FormField from "@/components/form-field";
import FormStatus from "@/components/form-status";
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

export default function AdminPage() {
  const router = useRouter();
  const [status, setStatus] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoadingSellers, setIsLoadingSellers] = useState(true);
  const [sellersError, setSellersError] = useState<string | null>(null);
  const [sellers, setSellers] = useState<SellerRow[]>([]);

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

  if (isCheckingAuth) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = {
      fullName: String(form.get("fullName") || "").trim(),
      shopName: String(form.get("shopName") || "").trim(),
      division: String(form.get("division") || "").trim(),
      district: String(form.get("district") || "").trim(),
      area: String(form.get("area") || "").trim(),
      phone: String(form.get("phone") || "").trim(),
      email: String(form.get("email") || "").trim(),
      password: String(form.get("password") || "").trim(),
    };

    try {
      await apiFetch("admin/sellers", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setStatus({ tone: "success", message: "Seller account created." });
      formElement.reset();
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Seller creation failed.";
      setStatus({ tone: "error", message });
    } finally {
      setIsSubmitting(false);
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
          <AdminCard title="Sellers" value="340" />
          <AdminCard title="Customers" value="5,200" />
          <AdminCard title="Flagged listings" value="12" />
        </div>
        <div className="mt-8 rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
          <h2 className="text-lg font-semibold">Recent reviews</h2>
          <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
            <li>FreshFish by Rahman - 5 stars - Great delivery speed.</li>
            <li>GreenHarvest - 4 stars - Good quality.</li>
          </ul>
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
                    <th className="px-4 py-2">View</th>
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
                        <Link
                          href={`/seller/${seller.id}`}
                          className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
        <div className="mt-8 rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--shadow)]">
          <h2 className="text-lg font-semibold">Create seller account</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Admin-only creation for new sellers. This should call the admin API
            endpoint when wired.
          </p>
          <form
            className="mt-6 grid gap-4 md:grid-cols-2"
            onSubmit={handleSubmit}
          >
            <FormField label="Full name" name="fullName" />
            <FormField label="Shop/Bazar name" name="shopName" />
            <FormField label="Division" name="division" />
            <FormField label="District" name="district" />
            <FormField label="Area" name="area" />
            <FormField label="Phone" name="phone" />
            <FormField label="Email" name="email" type="email" />
            <FormField label="Password" name="password" type="password" />
            <div className="md:col-span-2">
              <FormStatus tone={status?.tone} message={status?.message} />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-70 md:col-span-2"
            >
              {isSubmitting ? "Creating..." : "Create seller"}
            </button>
          </form>
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
