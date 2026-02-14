"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import Section from "@/components/section";
import RecentProducts from "@/components/recent-products";
import Hero from "@/components/hero";
import { apiFetch } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;

    apiFetch<{ user: { role: string } }>("auth/me")
      .then(({ user }) => {
        if (!isMounted) {
          return;
        }
        setUserRole(user.role);
        setIsCheckingAuth(false);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }
        setUserRole(null);
        setIsCheckingAuth(false);
      });

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (isCheckingAuth) {
    return null;
  }

  if (userRole === "admin") {
    router.replace("/admin");
    return null;
  }

  if (userRole === "seller") {
    router.replace("/dashboard/seller");
    return null;
  }

  return (
    <div>
      <SiteHeader />
      <main>
        <Hero />
        <Section
          title="Recent products"
          subtitle="Just posted from nearby sellers."
        >
          <RecentProducts />
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
