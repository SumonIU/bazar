"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import FormField from "@/components/form-field";
import FormStatus from "@/components/form-status";
import { apiFetch } from "@/lib/api";

type ProductDefaults = {
  name: string;
  nutritionInfo: string;
  image: string;
  price: number;
  unit: string;
  quantity: number;
  description: string;
};

type ProductApi = ProductDefaults & {
  id: number;
  images?: string | null;
};

export default function CreateProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEditMode = Boolean(editId);
  const [status, setStatus] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [productDefaults, setProductDefaults] =
    useState<ProductDefaults | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [productLoadError, setProductLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    apiFetch<{ user: { role: string } }>("auth/me")
      .then(({ user }) => {
        if (isMounted) {
          if (user.role !== "seller") {
            setAuthError("Only sellers can create products.");
            setTimeout(() => {
              router.replace("/");
            }, 2000);
          }
          setIsCheckingAuth(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setAuthError("Please log in as a seller to create products.");
          setTimeout(() => {
            router.replace("/login");
          }, 2000);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [router]);

  useEffect(() => {
    let isMounted = true;

    if (!editId) {
      setProductDefaults(null);
      setProductLoadError(null);
      return () => {
        isMounted = false;
      };
    }

    setIsLoadingProduct(true);
    setProductLoadError(null);

    apiFetch<ProductApi>(`products/${editId}`)
      .then((data) => {
        if (!isMounted) {
          return;
        }
        const normalizedPrice = Number(data.price);
        const normalizedQuantity = Number(data.quantity);
        setProductDefaults({
          name: data.name ?? "",
          nutritionInfo: data.nutritionInfo ?? "",
          image: data.image ?? data.images ?? "",
          price: Number.isFinite(normalizedPrice) ? normalizedPrice : 0,
          unit: data.unit ?? "",
          quantity: Number.isFinite(normalizedQuantity)
            ? normalizedQuantity
            : 0,
          description: data.description ?? "",
        });
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }
        const message =
          error && typeof error === "object" && "message" in error
            ? String(error.message)
            : "Unable to load product details.";
        setProductLoadError(message);
      })
      .finally(() => {
        if (!isMounted) {
          return;
        }
        setIsLoadingProduct(false);
      });

    return () => {
      isMounted = false;
    };
  }, [editId]);

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
      const endpoint = isEditMode && editId ? `products/${editId}` : "products";
      const method = isEditMode ? "PUT" : "POST";

      await apiFetch(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      setStatus({
        tone: "success",
        message: isEditMode
          ? "Product updated successfully!"
          : "Product created successfully!",
      });

      if (!isEditMode) {
        formElement.reset();
      }
      setTimeout(() => {
        router.push("/dashboard/seller");
      }, 1500);
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

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        {isCheckingAuth ? (
          <div className="rounded-3xl border border-[var(--line)] bg-white p-6 text-center shadow-[var(--shadow)]">
            <p className="text-sm text-[var(--muted)]">
              Verifying seller access...
            </p>
          </div>
        ) : authError ? (
          <div className="rounded-3xl border border-[var(--line)] bg-white p-6 text-center shadow-[var(--shadow)]">
            <p className="text-sm text-red-600">{authError}</p>
            <p className="mt-2 text-xs text-[var(--muted)]">Redirecting...</p>
          </div>
        ) : productLoadError ? (
          <div className="rounded-3xl border border-[var(--line)] bg-white p-6 text-center shadow-[var(--shadow)]">
            <p className="text-sm text-red-600">{productLoadError}</p>
          </div>
        ) : isEditMode && isLoadingProduct ? (
          <div className="rounded-3xl border border-[var(--line)] bg-white p-6 text-center shadow-[var(--shadow)]">
            <p className="text-sm text-[var(--muted)]">
              Loading product details...
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="font-serif text-3xl">
                  {isEditMode ? "Edit product" : "Create product"}
                </h1>
                <p className="mt-2 text-[var(--muted)]">
                  {isEditMode
                    ? "Update your listing details."
                    : "Add a new listing to your shop."}
                </p>
              </div>
              <Link
                href="/dashboard/seller"
                className="rounded-full border border-[var(--line)] px-4 py-2 text-sm hover:bg-[var(--panel)]"
              >
                Back to dashboard
              </Link>
            </div>
            <div className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
              <form
                className="grid gap-4 md:grid-cols-2"
                onSubmit={handleSubmit}
              >
                <FormField
                  label="Item name"
                  name="name"
                  required
                  defaultValue={productDefaults?.name}
                />
                <FormField
                  label="Unit"
                  name="unit"
                  placeholder="kg, pcs"
                  required
                  defaultValue={productDefaults?.unit}
                />
                <FormField
                  label="Price"
                  name="price"
                  type="number"
                  required
                  defaultValue={productDefaults?.price}
                />
                <FormField
                  label="Quantity"
                  name="quantity"
                  type="number"
                  required
                  defaultValue={productDefaults?.quantity}
                />
                <FormField
                  label="Nutrition info"
                  name="nutritionInfo"
                  placeholder="Optional"
                  defaultValue={productDefaults?.nutritionInfo}
                />
                <FormField
                  label="Image URL"
                  name="image"
                  placeholder="https://..."
                  defaultValue={productDefaults?.image}
                />
                <FormField
                  label="Description"
                  name="description"
                  placeholder="Optional"
                  defaultValue={productDefaults?.description}
                />
                <div className="md:col-span-2">
                  <FormStatus tone={status?.tone} message={status?.message} />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-70 md:col-span-2"
                >
                  {isSubmitting
                    ? isEditMode
                      ? "Saving..."
                      : "Creating..."
                    : isEditMode
                      ? "Save changes"
                      : "Create product"}
                </button>
              </form>
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
