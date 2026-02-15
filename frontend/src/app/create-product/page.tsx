"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import FormField from "@/components/form-field";
import FormStatus from "@/components/form-status";
import { apiFetch } from "@/lib/api";

export default function CreateProductPage() {
  const router = useRouter();
  const [status, setStatus] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

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
      setStatus({ tone: "success", message: "Product created successfully!" });
      formElement.reset();
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
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="font-serif text-3xl">Create product</h1>
                <p className="mt-2 text-[var(--muted)]">
                  Add a new listing to your shop.
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
                <FormField label="Item name" name="name" required />
                <FormField
                  label="Unit"
                  name="unit"
                  placeholder="kg, pcs"
                  required
                />
                <FormField label="Price" name="price" type="number" required />
                <FormField
                  label="Quantity"
                  name="quantity"
                  type="number"
                  required
                />
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
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
