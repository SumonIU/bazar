"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import FormField from "@/components/form-field";
import FormStatus from "@/components/form-status";
import { apiFetch } from "@/lib/api";

export default function CreateSellerPage() {
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
          if (user.role !== "admin") {
            setAuthError("Only admins can create sellers.");
            setTimeout(() => {
              router.replace("/");
            }, 2000);
          }
          setIsCheckingAuth(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setAuthError("Please log in as an admin to create sellers.");
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
      setStatus({ tone: "success", message: "Seller created successfully!" });
      formElement.reset();
      setTimeout(() => {
        router.push("/admin");
      }, 1500);
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
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        {isCheckingAuth ? (
          <div className="rounded-3xl border border-[var(--line)] bg-white p-6 text-center shadow-[var(--shadow)]">
            <p className="text-sm text-[var(--muted)]">
              Verifying admin access...
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
                <h1 className="font-serif text-3xl">Create seller</h1>
                <p className="mt-2 text-[var(--muted)]">
                  Create a new seller account and shop profile.
                </p>
              </div>
              <Link
                href="/admin"
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
                <FormField label="Full name" name="fullName" required />
                <FormField label="Email" name="email" type="email" required />
                <FormField label="Phone" name="phone" required />
                <FormField
                  label="Password"
                  name="password"
                  type="password"
                  required
                />
                <FormField label="Shop name" name="shopName" required />
                <FormField label="Division" name="division" required />
                <FormField label="District" name="district" required />
                <FormField label="Area" name="area" required />
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
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
