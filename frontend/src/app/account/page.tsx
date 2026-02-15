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
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

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
        setFullName(data.user.fullName || "");
        setPhone(data.user.phone || "");
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

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);

    try {
      const response = await apiFetch<AccountResponse>("auth/me", {
        method: "PUT",
        body: JSON.stringify({
          fullName,
          phone,
        }),
      });

      setAccount(response);
      setIsEditing(false);
    } catch (saveError) {
      const message =
        saveError && typeof saveError === "object" && "message" in saveError
          ? String(saveError.message)
          : "Failed to save changes.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFullName(account?.user.fullName || "");
    setPhone(account?.user.phone || "");
  };

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
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {isEditing ? (
                  <>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-[var(--muted)]">
                        Full name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="mt-2 w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-medium focus:border-[var(--accent)] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-[var(--muted)]">
                        Role
                      </label>
                      <p className="mt-2 text-sm font-medium">{user.role}</p>
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-[var(--muted)]">
                        Email
                      </label>
                      <p className="mt-2 text-sm font-medium">
                        {user.email ?? "Not provided"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-[var(--muted)]">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-2 w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-medium focus:border-[var(--accent)] focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs uppercase tracking-widest text-[var(--muted)]">
                        Default address
                      </label>
                      <p className="mt-2 text-sm font-medium">
                        {user.customerProfile?.defaultAddress ?? "Not provided"}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
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
                      value={
                        user.customerProfile?.defaultAddress ?? "Not provided"
                      }
                      spanFull
                    />
                  </>
                )}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="rounded-full border border-[var(--line)] bg-[var(--accent-strong)] px-6 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSaving ? "Saving..." : "Save changes"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="rounded-full border border-[var(--line)] px-6 py-2 text-sm font-semibold transition hover:bg-[var(--panel)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="rounded-full border border-[var(--line)] px-6 py-2 text-sm font-semibold transition hover:bg-[var(--panel)]"
                  >
                    Edit
                  </button>
                )}
              </div>
            </>
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
