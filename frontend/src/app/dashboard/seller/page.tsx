"use client";

import { useEffect, useState } from "react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import FormField from "@/components/form-field";
import FormStatus from "@/components/form-status";
import { apiFetch } from "@/lib/api";

const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8," +
  "<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'>" +
  "<rect width='100%' height='100%' fill='%23f2eee8'/>" +
  "<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'" +
  " fill='%23999898' font-size='10' font-family='Arial'>No image</text>" +
  "</svg>";

type DashboardStats = {
  activeListings: number;
  ordersToday: number;
  rating: number;
};

type DashboardItem = {
  id: number;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  status: "in_stock" | "out_of_stock";
};

type DashboardResponse = {
  stats: DashboardStats;
  recentItems: DashboardItem[];
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

export default function SellerDashboardPage() {
  const [status, setStatus] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentItems, setRecentItems] = useState<DashboardItem[]>([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(
    null,
  );

  const loadDashboard = async () => {
    setIsLoadingDashboard(true);
    setDashboardError(null);

    try {
      const data = await apiFetch<DashboardResponse>("seller/dashboard");
      setStats(data.stats);
      setRecentItems(data.recentItems ?? []);
    } catch (error) {
      const message =
        error && typeof error === "object" && "status" in error
          ? Number(error.status) === 401
            ? "Please log in as a seller to view the dashboard."
            : error && "message" in error
              ? String(error.message)
              : "Unable to load dashboard data."
          : error && typeof error === "object" && "message" in error
            ? String(error.message)
            : "Unable to load dashboard data.";
      setDashboardError(message);
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const loadProducts = async () => {
    setIsLoadingProducts(true);
    setProductsError(null);

    try {
      const data = await apiFetch<SellerProductApi[]>("seller/products");
      console.log("Fetched products:", data);
      setProducts(data ?? []);
    } catch (error) {
      const message =
        error && typeof error === "object" && "status" in error
          ? Number(error.status) === 401
            ? "Please log in as a seller to view products."
            : error && "message" in error
              ? String(error.message)
              : "Unable to load products."
          : error && typeof error === "object" && "message" in error
            ? String(error.message)
            : "Unable to load products.";
      setProductsError(message);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    loadProducts();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const image = String(form.get("image") || "").trim();
    const payload = {
      name: String(form.get("name") || "").trim(),
      nutritionInfo: String(form.get("nutritionInfo") || "").trim() || null,
      image: image || null,
      price: Number(form.get("price")),
      unit: String(form.get("unit") || "").trim(),
      quantity: Number(form.get("quantity")),
      description: String(form.get("description") || "").trim() || null,
    };

    try {
      await apiFetch("products", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setStatus({ tone: "success", message: "Product created." });
      loadDashboard();
      loadProducts();
      formElement.reset();
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Product creation failed.";
      setStatus({ tone: "error", message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!window.confirm("Delete this product?")) {
      return;
    }

    setDeletingProductId(productId);
    setStatus(null);

    try {
      await apiFetch(`products/${productId}`, {
        method: "DELETE",
      });
      setStatus({ tone: "success", message: "Product deleted." });
      loadDashboard();
      loadProducts();
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Product deletion failed.";
      setStatus({ tone: "error", message });
    } finally {
      setDeletingProductId(null);
    }
  };

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-6">
          <h1 className="font-serif text-3xl">Seller dashboard</h1>
          {dashboardError ? (
            <p className="text-sm text-red-600">{dashboardError}</p>
          ) : null}
          <div className="grid gap-6 md:grid-cols-3">
            <DashboardCard
              title="Active listings"
              value={
                isLoadingDashboard ? "..." : String(stats?.activeListings ?? 0)
              }
            />
            <DashboardCard
              title="Orders today"
              value={
                isLoadingDashboard ? "..." : String(stats?.ordersToday ?? 0)
              }
            />
            <DashboardCard
              title="Rating"
              value={
                isLoadingDashboard ? "..." : (stats?.rating ?? 0).toFixed(1)
              }
            />
          </div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--shadow)]">
            <h2 className="text-lg font-semibold">Quick actions</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <ActionButton label="Post new item" />
              <ActionButton label="Update inventory" />
              <ActionButton label="View reviews" />
            </div>
          </div>
          <div className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
            <h2 className="text-lg font-semibold">Recent items</h2>
            {isLoadingDashboard ? (
              <p className="mt-4 text-sm text-[var(--muted)]">
                Loading items...
              </p>
            ) : recentItems.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--muted)]">No items yet.</p>
            ) : (
              <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
                {recentItems.map((item) => (
                  <li key={item.id}>
                    {item.name} - BDT {item.price} / {item.unit} -
                    {item.status === "in_stock" ? "In stock" : "Out of stock"}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--shadow)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Your products</h2>
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
              <p className="mt-4 text-sm text-[var(--muted)]">
                No products yet.
              </p>
            ) : null}
            {products.length > 0 ? (
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
                                src={product.image}
                                alt={product.name}
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
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--shadow)]">
            <h2 className="text-lg font-semibold">Create product</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Sellers can add new listings here.
            </p>
            <form
              className="mt-6 grid gap-4 md:grid-cols-2"
              onSubmit={handleSubmit}
            >
              <FormField label="Item name" name="name" />
              <FormField label="Unit" name="unit" placeholder="kg, pcs" />
              <FormField label="Price" name="price" type="number" />
              <FormField label="Quantity" name="quantity" type="number" />
              <FormField
                label="Nutrition info"
                name="nutritionInfo"
                placeholder="Optional"
              />
              <FormField
                label="Image URL"
                name="image"
                placeholder="https://..."
              />
              <FormField
                label="Description"
                name="description"
                placeholder="Optional"
              />
              <div className="md:col-span-2">
                <FormStatus tone={status?.tone} message={status?.message} />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-70 md:col-span-2"
              >
                {isSubmitting ? "Creating..." : "Create product"}
              </button>
            </form>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function DashboardCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--shadow)]">
      <p className="text-sm text-[var(--muted)]">{title}</p>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function ActionButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm font-medium"
    >
      {label}
    </button>
  );
}
