"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage, useTheme } from "@/components/app-providers";
import { apiFetch } from "@/lib/api";

export default function SiteHeader() {
  const router = useRouter();
  const { copy, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;

    apiFetch<{ user: { role: string } }>("auth/me")
      .then(({ user }) => {
        if (isMounted) {
          setIsLoggedIn(true);
          setUserRole(user.role);
          setIsCheckingAuth(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLoggedIn(false);
          setUserRole(null);
          setIsCheckingAuth(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await apiFetch("auth/logout", { method: "POST" });
    } finally {
      setIsLoggedIn(false);
      setUserRole(null);
      router.replace("/login");
    }
  };

  return (
    <header className="texture-grid sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--panel)]/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg font-semibold tracking-wide">
            Bazar.com
          </Link>
          <span className="hidden text-sm text-[var(--muted)] md:inline">
            {copy.brandTagline}
          </span>
        </div>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="/search" className="hover:text-[var(--accent)]">
            {copy.explore}
          </Link>
          <Link href="/seller/001" className="hover:text-[var(--accent)]">
            {copy.sellers}
          </Link>
          <Link href="/products" className="hover:text-[var(--accent)]">
            {copy.products}
          </Link>
          {userRole === "customer" ? (
            <Link href="/cart" className="hover:text-[var(--accent)]">
              Cart
            </Link>
          ) : null}
          <Link href="/" className="hover:text-[var(--accent)]">
            {copy.support}
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-full border border-[var(--line)] px-3 py-1 text-xs uppercase tracking-wide"
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          <button
            type="button"
            onClick={() => setLanguage(language === "en" ? "bn" : "en")}
            className="rounded-full border border-[var(--line)] px-3 py-1 text-xs uppercase tracking-wide"
          >
            {language === "en" ? "BN" : "EN"}
          </button>
          {isLoggedIn ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-[var(--line)] px-4 py-2 text-sm"
            >
              Logout
            </button>
          ) : !isCheckingAuth ? (
            <>
              <Link
                href="/login"
                className="rounded-full border border-[var(--line)] px-4 py-2 text-sm"
              >
                {copy.login}
              </Link>
              <Link
                href="/signup/seller"
                className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm text-black shadow"
              >
                {copy.signup}
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
