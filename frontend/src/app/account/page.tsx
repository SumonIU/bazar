"use client";

import { useEffect, useState } from "react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { apiFetch } from "@/lib/api";

type AccountResponse = {
  user: {
    fullName: string;
    email: string | null;
    phone: string | null;
    role: string;
    customerProfile?: {
      defaultAddress: string | null;
    } | null;
  };
};

export default function AccountPage() {
  const [account, setAccount] = useState<AccountResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    setError(null);

    apiFetch<AccountResponse>("auth/me")
      .then((data) => {
        if (!isMounted) {
          return;
        }
        setAccount(data);
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
            : "Unable to load account information.";
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

  const user = account?.user;

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <h1 className="font-serif text-3xl">My account</h1>
        <p className="mt-2 text-[var(--muted)]">
          View your profile details and saved information.
        </p>
        <div className="mt-8 rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {isLoading ? (
            <p className="text-sm text-[var(--muted)]">
              Loading account information...
            </p>
          ) : user ? (
            <div className="grid gap-4 md:grid-cols-2">
              <AccountField label="Full name" value={user.fullName} />
              <AccountField label="Role" value={user.role} />
              <AccountField
                label="Email"
                value={user.email ?? "Not provided"}
              />
              <AccountField
                label="Phone"
                value={user.phone ?? "Not provided"}
              />
              <AccountField
                label="Default address"
                value={user.customerProfile?.defaultAddress ?? "Not provided"}
                spanFull
              />
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">
              No account information found.
            </p>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function AccountField({
  label,
  value,
  spanFull,
}: {
  label: string;
  value: string;
  spanFull?: boolean;
}) {
  return (
    <div className={spanFull ? "md:col-span-2" : undefined}>
      <p className="text-xs uppercase tracking-widest text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium">{value}</p>
    </div>
  );
}
